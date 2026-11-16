import test from 'node:test';
import assert from 'node:assert/strict';
import { topicHrefs } from './ranking-urls.js';

test('the all-sites indicator rankings live under /rankings/', () => {
  assert.deepEqual(topicHrefs('accessibility', '', 3), ['/rankings/accessibility/', '/rankings/accessibility/1/', '/rankings/accessibility/2/']);
});

test('cohort indicator rankings sit under their cohort', () => {
  assert.deepEqual(topicHrefs('usability', 'states/', 2), ['/rankings/states/usability/', '/rankings/states/usability/1/']);
});
