/**
 * Partial-scan detection. Run: node --test scripts/counties.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPartial } from './counties.js';

const full = { status: 200, botability: { crawlable: true, canonical: true }, usability: { ogtitle: true, ogdescription: false, title: true } };

test('a record with the fetch-derived checks is a full scan', () => {
  assert.equal(isPartial(full), false);
});

test('a record whose fetch never ran (no crawlable, no Open Graph checks) is partial', () => {
  assert.equal(isPartial({ status: 200, botability: { canonical: true }, usability: { title: true } }), true);
  assert.equal(isPartial({ status: 200, botability: { crawlable: true }, usability: { title: true } }), true);
  assert.equal(isPartial({ status: 200, botability: {}, usability: { ogtitle: true } }), true);
});

test('text-content is a measurement since 2026-10-24, not the fetch marker: its absence alone is not a partial scan', () => {
  // 4,050 of 4,101 scanned homepages were wrongly reclassified to 995 on 2026-10-25 when it was
  assert.equal(isPartial({ ...full, botability: { crawlable: true, canonical: true } }), false);
  assert.equal(isPartial({ ...full, botability: { crawlable: true, 'text-content': false } }), false);
});
