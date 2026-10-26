/**
 * Issue page verdicts. Run: node --test scripts/issues.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ISSUES, buildIssuePage, GROUPS } from './issues.js';

const audits = { botability: { displayName: 'Botability', attributes: [{ key: 'text-content', displayName: 'Content available in document', description: 'The page\'s main content loads without requiring JavaScript.' }] } };
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
