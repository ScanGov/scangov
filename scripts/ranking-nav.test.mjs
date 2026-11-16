import test from 'node:test';
import assert from 'node:assert/strict';
import { rankingCrumbs, rankingFilters, isRankingList } from './ranking-nav.js';

const audits = { accessibility: { displayName: 'Accessibility' }, usability: { displayName: 'Usability' } };
const page = (url, extra = {}) => ({ page: { url }, audits, member: [], ...extra });

test('the all-sites rankings page has only a current crumb', () => {
  assert.deepEqual(rankingCrumbs(page('/rankings/')), { parents: [], current: 'Rankings' });
});

test('an indicator under all sites has the Rankings parent', () => {
  assert.deepEqual(rankingCrumbs(page('/rankings/accessibility/')), { parents: [{ title: 'Rankings', url: '/rankings/' }], current: 'Accessibility' });
});

test('the indicator page at the top level has the same breadcrumb and filters', () => {
  assert.deepEqual(rankingCrumbs(page('/accessibility/')), { parents: [{ title: 'Rankings', url: '/rankings/' }], current: 'Accessibility' });
  const f = rankingFilters(page('/accessibility/1/'));
  assert.equal(f.specificAttribute, 'accessibility');
  assert.equal(f.currentsort, '');
});

test('a group page and its indicator page nest', () => {
  assert.deepEqual(rankingCrumbs(page('/rankings/states/')), { parents: [{ title: 'Rankings', url: '/rankings/' }], current: 'States' });
  assert.deepEqual(rankingCrumbs(page('/rankings/states/usability/2/')).parents.map(p => p.title), ['Rankings', 'States']);
  assert.equal(rankingCrumbs(page('/rankings/states/usability/2/')).current, 'Usability');
});

test('pages that are not lists get nothing', () => {
  assert.equal(isRankingList({ page: { url: '/rankings/redirect/' } }), false);
  assert.equal(rankingCrumbs({ page: { url: '/x/' }, audits }), undefined);
});

test('filters carry the group and the indicator', () => {
  const f = rankingFilters(page('/rankings/counties/accessibility/'));
  assert.equal(f.currentsort, 'counties');
  assert.equal(f.specificAttribute, 'accessibility');
  assert.equal(f.stateContext, false);
});

test('a state page carries its state, an education group page its group', () => {
  const st = { slug: 'tx', name: 'Texas' };
  const a = rankingFilters({ page: { url: '/rankings/counties/tx/' }, audits, st, member: [] });
  assert.equal(a.stateContext, true);
  assert.equal(a.st, st);
  const grp = { path: 'system/x/' };
  const b = rankingFilters({ page: { url: '/rankings/edu/system/x/usability/' }, audits, gp: { group: grp, topic: 'usability' } });
  assert.equal(b.groupContext, true);
  assert.equal(b.specificAttribute, 'usability');
  assert.equal(b.currentsort, 'edu');
});
