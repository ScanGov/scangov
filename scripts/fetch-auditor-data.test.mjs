/**
 * Which homepage records the data fetch keeps. Run: node --test scripts/fetch-auditor-data.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isCompleteRecord } from './fetch-auditor-data.js';

const scored = (overrides = {}) => ({
  urlkey: 'x.gov', status: 200, overallScore: 80,
  scores: {
    botability: { attributes: { crawlable: true }, all: 1, correct: 1, score: 100 },
    accessibility: { attributes: { 'image-alt': true }, all: 1, correct: 1, score: 100 },
    security: { attributes: { https: true }, all: 1, correct: 1, score: 100 },
    usability: { attributes: { title: true }, all: 1, correct: 1, score: 100 },
    readability: { attributes: { 'reading-level': true }, all: 1, correct: 1, score: 100 },
    ...overrides,
  },
});

test('a fully scored record is complete', () => {
  assert.equal(isCompleteRecord(scored()).complete, true);
});

test('an unscorable readability topic (client-side render, non-English, skipped) is still complete', () => {
  // alabama.gov in the 2026-10-25 payload: the served HTML has no readable text
  const r = isCompleteRecord(scored({ readability: { attributes: {}, all: 0, correct: 0, score: null } }));
  assert.equal(r.complete, true);
});

test('any other topic with no attributes, or missing, is incomplete', () => {
  assert.equal(isCompleteRecord(scored({ security: { attributes: {}, all: 0, correct: 0, score: null } })).complete, false);
  const s = scored(); delete s.scores.readability;
  assert.equal(isCompleteRecord(s).complete, false);
  assert.match(isCompleteRecord(s).reason, /missing topic: readability/);
});

test('blocked homepages are complete when they carry a urlkey and status', () => {
  assert.equal(isCompleteRecord({ urlkey: 'nh.gov', status: 403 }).complete, true);
  assert.equal(isCompleteRecord({ status: 403 }).complete, false);
});

// validateData: is a payload good enough to replace the committed data file?
import { validateData } from './fetch-auditor-data.js';
import { stateDomainList, countyDomainList } from '../_data/variables.js';

const DAY = 86400000;
const NOW = Date.parse('2026-11-08T12:00:00Z');
// A healthy payload: every state, 5,200 graded federal-category records, and
// 100 counties, all scanned this week.
function payload({ counties = 100, blockedShare = 0, time = NOW - DAY } = {}) {
  const records = [];
  for (const urlkey of stateDomainList) records.push({ urlkey, status: 200, time });
  for (let i = 0; i < 5200; i++) records.push({ urlkey: `agency${i}.gov`, status: 200, time });
  for (const urlkey of countyDomainList.slice(0, counties)) records.push({ urlkey, status: 200, time });
  const blocked = Math.floor(records.length * blockedShare);
  for (let i = 0; i < blocked; i++) records[records.length - 1 - i].status = 403;
  return records;
}

test('a healthy payload has no errors or warnings', () => {
  assert.deepEqual(validateData(payload(), payload(), { now: NOW }), { errors: [], warnings: [] });
});

test('a missing state is an error', () => {
  const p = payload().filter((d) => d.urlkey !== 'ca.gov');
  const { errors } = validateData(p, [], { now: NOW });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Missing 1 state\(s\): ca.gov/);
});

test('a payload where the scanner was blocked en masse is an error even with every domain present', () => {
  const { errors } = validateData(payload({ blockedShare: 0.3 }), payload(), { now: NOW });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /70\.0% of records are graded .* minimum 75%/);
});

test('losing a category is an error even when the overall drop is small', () => {
  // 20 of 100 counties gone is 0.4% of all domains, well under the overall 10%.
  const { errors } = validateData(payload({ counties: 80 }), payload(), { now: NOW });
  // Two of the first hundred county domains classify as state or city sites.
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^counties: 2\d\.\d% of domains missing \(20 of 9\d, max 10%\)$/);
});

test('a stale payload is a warning, not an error', () => {
  const { errors, warnings } = validateData(payload({ time: NOW - 20 * DAY }), payload(), { now: NOW });
  assert.deepEqual(errors, []);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Newest scan is 20 days old \(2026-10-19\)/);
});

test('a tiny payload fails the floor', () => {
  const { errors } = validateData(payload().slice(0, 900), [], { now: NOW });
  assert.match(errors[0], /Only 900 records \(minimum: 5000\)/);
});
