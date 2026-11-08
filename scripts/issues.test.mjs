/**
 * Issue page verdicts. Run: node --test scripts/issues.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ISSUES, buildIssuePage, buildGroups, gradeLevelOf, formatGrade, issueHrefFor } from './issues.js';

// The county group, as the pages get it (GROUPS became buildGroups when the other groups were added).
const GROUPS = [buildGroups({ cities: new Set(), states: new Set(), edu: new Set() }).find(g => g.key === 'counties')];

const audits = {
  botability: { displayName: 'Botability', attributes: [{ key: 'text-content', displayName: 'Content available in document', description: 'The page\'s main content loads without requiring JavaScript.' }] },
  readability: { displayName: 'Readability', attributes: [{ key: 'reading-level', displayName: 'Reading level', description: 'Page text reads at or below a 7th grade level so most users can understand it.', why: 'standard why' }] },
};
const stateNames = { OH: { name: 'Ohio', slug: 'ohio' } };
const county = (urlkey, name, botability) => ({
  urlkey, name, status: 200, time: 1, overallScore: 50,
  scores: { botability: { score: 50 } },
  botability: { crawlable: true, ...botability },
  usability: { ogtitle: true },
});

test('needs-javascript: a site fails only when text-content is false; a record without the key counts as passing (the check targeted suspected sites)', () => {
  const issue = ISSUES.find(i => i.slug === 'needs-javascript');
  const page = buildIssuePage(issue, GROUPS[0], [
    county('a.gov', 'A County, OH', { 'text-content': false }),
    county('b.gov', 'B County, OH', { 'text-content': true }),
    county('c.gov', 'C County, OH', {}),
  ], audits, stateNames, null);
  assert.equal(page.url, '/issues/needs-javascript/counties/');
  assert.equal(page.title, 'County websites that need JavaScript to show their content');
  assert.equal(page.scoredCount, 3);
  assert.equal(page.testedCount, 3);
  assert.equal(page.untestedCount, 0);
  assert.equal(page.failCount, 1);
  assert.equal(page.passCount, 2);
  assert.equal(page.share, 1 / 3);
  assert.deepEqual(page.failing.map(s => s.urlkey), ['a.gov']);
  assert.equal(page.states[0].tested, 3);
  assert.match(page.check.note, /counts as passing/);
  assert.equal(page.breakdown, null);
});

test('reading-level: fails on the verdict, buckets failing sites by ARI grade in grade order, sets too-little-text sites apart, and is listed', () => {
  const issue = ISSUES.find(i => i.slug === 'reading-level');
  const site = (urlkey, verdict, ari, info) => ({ ...county(urlkey, `${urlkey} County, OH`, {}), readability: verdict === undefined ? {} : { 'reading-level': verdict }, ari, fk: ari, readabilityInfo: info, scores: { readability: { score: 50 } } });
  const page = buildIssuePage(issue, GROUPS[0], [
    site('a.gov', false, 12.2, { words: 300, sentences: 20, source: 'main' }),
    site('b.gov', false, 9.1),
    site('c.gov', false, 9.4),
    site('d.gov', false, 21),
    site('e.gov', true, 6.0),
    site('f.gov', undefined, undefined),
    site('g.gov', undefined, 7.1, { words: 40, sentences: 5, source: 'body', skipped: 'not-enough-text' }),
  ], audits, stateNames, null);
  assert.equal(page.unlisted, false);
  assert.equal(page.scoredCount, 7);
  assert.equal(page.testedCount, 5);
  assert.equal(page.untestedCount, 2);
  assert.equal(page.skippedCount, 1);
  assert.equal(page.skipped.label, 'Too little text to score');
  assert.equal(page.failCount, 4);
  assert.equal(page.check.why, issue.why);
  assert.equal(page.check.description, 'The homepage text reads at or below an 8th grade level.');
  assert.deepEqual(page.columns.map(c => c.header), ['ARI', 'FK']);
  assert.deepEqual(page.failing[0].cells.map(c => c.text), ['12.2', '12.2']);
  assert.deepEqual(page.breakdown.rows.map(r => [r.label, r.value]), [['9th grade', 2], ['12th grade', 1], ['Graduate school', 1]]);
  assert.equal(page.breakdown.subtitle, 'The 4 county sites that read above an 8th grade level, grouped by grade.');
});

test('formatGrade shows one decimal and never a negative grade', () => {
  assert.equal(formatGrade(9.14), '9.1');
  assert.equal(formatGrade(-2.8), '0.0');
  assert.equal(formatGrade(undefined), '');
});

test('gradeLevelOf maps ARI scores to school grades', () => {
  assert.equal(gradeLevelOf(8.5), '9th grade');
  assert.equal(gradeLevelOf(8.4), '8th grade or below');
  assert.equal(gradeLevelOf(12.6), 'College');
  assert.equal(gradeLevelOf(16.4), 'College');
  assert.equal(gradeLevelOf(16.5), 'Graduate school');
  assert.equal(gradeLevelOf(undefined), 'No score');
});

test('issueHrefFor: a check links its issue page for groups that have one, with a state anchor when asked; unlisted and uncovered checks return null', () => {
  const counties = issueHrefFor('counties');
  assert.equal(counties('security', 'dotgov'), '/issues/not-dotgov/counties/');
  assert.equal(counties('botability', 'xml'), '/issues/sitemap/counties/', 'a feature issue covers each of its checks');
  assert.equal(counties('usability', 'nonexistent-check'), null);
  assert.equal(issueHrefFor('counties', 'tx')('botability', 'text-content'), '/issues/needs-javascript/counties/#state-tx');
  const notDotgov = ISSUES.find(i => i.slug === 'not-dotgov');
  if (notDotgov.groups && !notDotgov.groups.includes('edu')) assert.equal(issueHrefFor('edu')('security', 'dotgov'), null, 'no page for that group');
  const unlisted = ISSUES.find(i => i.unlisted);
  if (unlisted) assert.equal(counties(unlisted.topic, unlisted.check || unlisted.checks[0]), null, 'unlisted issues are not linked');
});
