import test from 'node:test';
import assert from 'node:assert/strict';
import { topicHrefs, legacyHrefs } from './ranking-urls.js';

test('the all-sites indicator pages live at the top level', () => {
  assert.deepEqual(topicHrefs('accessibility', '', 3), ['/accessibility/', '/accessibility/1/', '/accessibility/2/']);
});

test('cohort indicator pages stay under /rankings/', () => {
  assert.deepEqual(topicHrefs('usability', 'states/', 2), ['/rankings/states/usability/', '/rankings/states/usability/1/']);
});

test('every all-sites page has an old address that maps to its new one', () => {
  const next = topicHrefs('security', '', 4);
  const old = legacyHrefs('security', '', 4);
  assert.equal(old.length, next.length);
  assert.equal(old[0], '/rankings/security/');
  assert.equal(old[3], '/rankings/security/3/');
  old.forEach((href, i) => assert.equal(href.replace('/rankings', ''), next[i]));
});

test('cohort pages have no old address', () => {
  assert.equal(legacyHrefs('usability', 'counties/', 2), null);
});
