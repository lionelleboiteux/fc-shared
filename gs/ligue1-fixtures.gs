/**
 * Ligue 1 fixtures cache — canonical implementation shared by compos and
 * DNP's apps-script/Code.gs. Apps Script has no live cross-project import
 * (no equivalent of this repo's browser-side `<script src=".../nav.js">`
 * trick), so this file is a copy-paste source of truth, not something
 * either project loads at runtime — same convention already used for the
 * CacheService/onEdit pattern and the TEAM_LOGOS/team-name maps duplicated
 * between the two projects' own files. When this file changes, re-copy the
 * affected functions into both Code.gs files by hand and redeploy each
 * (Apps Script editor > Manage deployments > New version > Deploy — see
 * either project's README for the full manual-redeploy steps).
 *
 * Solves two differently-shaped problems with one mechanism:
 *   - compos used to call ma-api.ligue1.fr live on every cache-cold
 *     `?journee=` request, which stacked external-API latency on top of
 *     the Apps Script Web App's own cold-start latency.
 *   - DNP could only ever show opponent/home-away for the live "current"
 *     gameweek, because pronos's API — its only source for this — never
 *     exposes any other gameweek's fixtures.
 * Both are fixed by fetching the whole season's fixtures once, into a
 * "Fixtures" tab in each project's own Sheet, and having doGet read that
 * tab locally — zero external calls on the request path, for either
 * project, for any journée.
 *
 * Requires the host file to already define:
 *   - LIGUE1_API_BASE, LIGUE1_CHAMPIONSHIP_ID
 *   - fetchGameweekMatches_(gameweekNumber)
 *   - API_TEAM_NAME_MAP + mapApiTeamName_(apiName)
 *   - gameweekNumberFromJournee_(journee)
 *   - PRONOS_API_BASE, PRONOS_L1_LEAGUE_ID
 *   - bumpCacheVersion_()
 * (compos already has all of these; DNP needs all of them added — copy
 * verbatim from compos's Code.gs alongside this block.)
 *
 * Setup (once per project, in the Apps Script editor, after pasting this
 * block into Code.gs and redeploying): select setupFixturesTrigger_ in the
 * function dropdown and click Run — installs a 6h trigger that backfills
 * the whole season on its first run (well within Apps Script's 6-minute
 * trigger execution limit for a 34-gameweek season: ~34 sequential
 * UrlFetchApp calls) and thereafter keeps the near-term window fresh
 * against broadcast-driven kickoff reschedules. To see data immediately
 * rather than waiting for the first scheduled firing, also run
 * refreshFixtures_ once by hand right after.
 */

var SEASON_GAMEWEEKS = 34;
var SHEET_NAME_FIXTURES = 'Fixtures';
// How many gameweeks past "current" to re-fetch on every trigger run, so a
// reschedule announced a few weeks out still gets picked up. Once a
// gameweek is cached and outside this window it's never refetched — a
// played match's fixture info doesn't change.
var FIXTURES_REFRESH_LOOKAHEAD = 3;

/**
 * The live current Ligue 1 gameweek number, server-side — same
 * jeu-des-pronos endpoint each project's frontend already uses to default
 * its journée picker. Returns null on any failure; callers must treat that
 * as "unknown", not "gameweek 0".
 */
function fetchCurrentGameweekNumber_() {
  var url = PRONOS_API_BASE + '/v1/leagues/' + PRONOS_L1_LEAGUE_ID + '/current';
  var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (resp.getResponseCode() !== 200) return null;
  var data = JSON.parse(resp.getContentText());
  return data && data.gameweek ? data.gameweek.number : null;
}

function getOrCreateFixturesSheet_() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(SHEET_NAME_FIXTURES);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME_FIXTURES);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 5).setValues([['Journée', 'Équipe', 'Adversaire', 'Domicile', 'CoupEnvoi']]);
  }
  return sheet;
}

/**
 * All cached fixture rows, grouped by extracted gameweek number — this tab
 * is always machine-written as "Journée N", but matching by number keeps
 * it consistent with how the rest of each project's doGet already
 * tolerates journée-string variants (see gameweekNumberFromJournee_).
 *
 * CoupEnvoi is stored and read back as a real Sheets Date value, not text
 * — deliberately *leaning on* Sheets' native datetime handling here, the
 * opposite of e.g. compos's formationText_, which defends against a plain
 * string being unwantedly reinterpreted as a date.
 */
function readAllFixtureRows_(sheet) {
  var lastRow = sheet.getLastRow();
  var byGw = {};
  if (lastRow < 2) return byGw;
  var values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  values.forEach(function (row) {
    var journee = String(row[0] || '').trim();
    var equipe = String(row[1] || '').trim();
    if (!journee || !equipe) return;
    var gw = gameweekNumberFromJournee_(journee);
    if (isNaN(gw)) return;
    var kickoff = row[4];
    if (!(kickoff instanceof Date) || isNaN(kickoff.getTime())) return;
    if (!byGw[gw]) byGw[gw] = [];
    byGw[gw].push({
      journee: journee,
      equipe: equipe,
      opponent: String(row[2] || '').trim(),
      isHome: row[3] === true,
      kickoff: kickoff
    });
  });
  return byGw;
}

/**
 * Pure Sheet read — no external call. Returns
 * { equipe: { opponent, isHome, kickoff } } for this gameweek, {} if
 * nothing has been cached for it yet (e.g. the trigger hasn't reached a
 * far-future gameweek, or ligue1.fr hasn't published it yet).
 */
function readFixturesForGameweek_(gameweekNumber) {
  var rows = readAllFixtureRows_(getOrCreateFixturesSheet_())[gameweekNumber] || [];
  var byEquipe = {};
  rows.forEach(function (r) {
    byEquipe[r.equipe] = { opponent: r.opponent, isHome: r.isHome, kickoff: r.kickoff.toISOString() };
  });
  return byEquipe;
}

/**
 * Builds one gameweek's fixture rows from ma-api.ligue1.fr's match-week
 * list — the same list fetchGameweekMatches_ already returns for other
 * purposes (recordActualCompos_ in compos), just put to a different use
 * here, not a new endpoint. Returns [] (never a partial result) on any
 * failure, so a transient API hiccup can't overwrite already-cached good
 * data — see refreshFixtures_'s "only replace when non-empty" rule.
 */
function buildFixtureRowsForGameweek_(gameweekNumber) {
  var journee = 'Journée ' + gameweekNumber;
  var rows = [];
  try {
    fetchGameweekMatches_(gameweekNumber).forEach(function (m) {
      if (!m.home || !m.away || !m.date) return;
      var home = mapApiTeamName_(m.home.clubIdentity && m.home.clubIdentity.name);
      var away = mapApiTeamName_(m.away.clubIdentity && m.away.clubIdentity.name);
      if (!home || !away) return;
      var kickoff = new Date(m.date);
      if (isNaN(kickoff.getTime())) return;
      rows.push({ journee: journee, equipe: home, opponent: away, isHome: true, kickoff: kickoff });
      rows.push({ journee: journee, equipe: away, opponent: home, isHome: false, kickoff: kickoff });
    });
  } catch (err) {
    return [];
  }
  return rows;
}

/**
 * Trigger body. Refetches and rewrites (a) any gameweek with zero cached
 * rows yet — the first run after setup backfills the whole season this
 * way, ~34 UrlFetchApp calls, comfortably under Apps Script's 6-minute
 * trigger execution limit — and (b) every gameweek within
 * [currentGameweek, currentGameweek + FIXTURES_REFRESH_LOOKAHEAD], to
 * absorb broadcast-driven kickoff reschedules for upcoming matches.
 * Everything else already cached is left untouched. Rewrites the whole
 * tab's data rows in one batched write if anything changed, then bumps
 * the doGet response cache version so the next request sees fresh data
 * immediately instead of waiting out the 6h TTL.
 */
function refreshFixtures_() {
  var sheet = getOrCreateFixturesSheet_();
  var byGw = readAllFixtureRows_(sheet);
  var current = fetchCurrentGameweekNumber_();
  var changed = false;

  for (var gw = 1; gw <= SEASON_GAMEWEEKS; gw++) {
    var inWindow = current != null && gw >= current && gw <= current + FIXTURES_REFRESH_LOOKAHEAD;
    var missing = !byGw[gw] || byGw[gw].length === 0;
    if (!missing && !inWindow) continue;

    var fresh = buildFixtureRowsForGameweek_(gw);
    if (fresh.length) {
      byGw[gw] = fresh;
      changed = true;
    }
  }

  if (!changed) return;

  var allRows = [];
  for (var g = 1; g <= SEASON_GAMEWEEKS; g++) {
    (byGw[g] || []).forEach(function (r) { allRows.push(r); });
  }

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, 5).clearContent();
  if (allRows.length) {
    var values = allRows.map(function (r) { return [r.journee, r.equipe, r.opponent, r.isHome, r.kickoff]; });
    sheet.getRange(2, 1, values.length, 5).setValues(values);
  }

  bumpCacheVersion_();
}

/**
 * One-time setup: run this once from the Apps Script editor to install the
 * 6h trigger. Re-running is safe — clears any trigger it previously
 * installed for refreshFixtures_ first, so triggers never stack up. Run
 * refreshFixtures_ once by hand afterward to populate the Fixtures tab
 * immediately instead of waiting for the first scheduled firing.
 */
function setupFixturesTrigger_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'refreshFixtures_') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('refreshFixtures_').timeBased().everyHours(6).create();
}
