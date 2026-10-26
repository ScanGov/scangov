/**
 * Issue page verdicts. Run: node --test scripts/issues.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ISSUES, buildIssuePage, GROUPS, gradeLevelOf } from './issues.js';

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

test('reading-level: fails on the verdict, buckets failing sites by ARI grade in grade order, and stays unlisted', () => {
  const issue = ISSUES.find(i => i.slug === 'reading-level');
  const site = (urlkey, verdict, ari) => ({ ...county(urlkey, `${urlkey} County, OH`, {}), readability: verdict === undefined ? {} : { 'reading-level': verdict }, ari, scores: { readability: { score: 50 } } });
  const page = buildIssuePage(issue, GROUPS[0], [
    site('a.gov', false, 12.2),
    site('b.gov', false, 9.1),
    site('c.gov', false, 9.4),
    site('d.gov', false, 21),
    site('e.gov', true, 6.0),
    site('f.gov', undefined, undefined),
  ], audits, stateNames, null);
  assert.equal(page.unlisted, true);
  assert.equal(page.testedCount, 5);
  assert.equal(page.untestedCount, 1);
  assert.equal(page.failCount, 4);
  assert.equal(page.check.why, issue.why);
  assert.deepEqual(page.breakdown.rows.map(r => [r.label, r.value]), [['9th grade', 2], ['12th grade', 1], ['Graduate school', 1]]);
  assert.equal(page.breakdown.subtitle, 'The 4 county sites that read above an 8th grade level, grouped by grade level.');
});

test('gradeLevelOf maps ARI scores to school grades', () => {
  assert.equal(gradeLevelOf(8.5), '9th grade');
  assert.equal(gradeLevelOf(8.4), '8th grade or below');
  assert.equal(gradeLevelOf(12.6), 'College');
  assert.equal(gradeLevelOf(16.4), 'College');
  assert.equal(gradeLevelOf(16.5), 'Graduate school');
  assert.equal(gradeLevelOf(undefined), 'No score');
});
