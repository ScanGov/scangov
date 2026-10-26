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
