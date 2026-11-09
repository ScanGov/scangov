/**
 * Data normalization applied to every auditor fetch. Run: node --test scripts/normalize-audit-data.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NO_CONTENT_STATUS, dedupeDomains, normalizeAuditData } from './normalize-audit-data.js';

// A fully scanned record: the no-content rule (scripts/counties.js isPartial)
// looks for the crawlable check and an Open Graph check.
const rec = (urlkey, time, extra = {}) => ({
  urlkey, time, name: `${urlkey} ${time}`, status: 200, scores: { a: 1 },
  botability: { crawlable: true }, usability: { ogtitle: true }, ...extra,
});

test('records sharing a urlkey collapse to the newest scan, in place', () => {
  const input = [rec('a.gov', 1), rec('erau.edu', 10), rec('b.gov', 2), rec('erau.edu', 30), rec('erau.edu', 20)];
  const { records, dropped } = dedupeDomains(input);
  assert.deepEqual(records.map((d) => [d.urlkey, d.time]), [['a.gov', 1], ['erau.edu', 30], ['b.gov', 2]]);
  assert.deepEqual(dropped.map((d) => d.time).sort(), [10, 20]);
});

test('records without a urlkey are left alone', () => {
  const input = [{ status: 403 }, rec('a.gov', 1), { status: 403 }];
  const { records, dropped } = dedupeDomains(input);
  assert.equal(records.length, 3);
  assert.equal(dropped.length, 0);
});

test('a duplicate with no scan time loses to one that has it', () => {
  const { records } = dedupeDomains([rec('a.gov', undefined), rec('a.gov', 5)]);
  assert.deepEqual(records.map((d) => d.time), [5]);
});

test('normalizeAuditData dedupes before applying the no-content rule and reports both', () => {
  // b.gov answered but returned no page content (no crawlable check).
  const input = [rec('a.gov', 1), rec('a.gov', 2), rec('b.gov', 1, { botability: {} })];
  const { records, reclassified, deduped } = normalizeAuditData(input);
  assert.deepEqual(records.map((d) => [d.urlkey, d.time, d.status]), [['a.gov', 2, 200], ['b.gov', 1, NO_CONTENT_STATUS]]);
  assert.equal(deduped.length, 1);
  assert.equal(deduped[0].time, 1);
  assert.equal(reclassified, 1);
});
