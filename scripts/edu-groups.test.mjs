/**
 * Education peer groups. Run: node --test scripts/edu-groups.test.mjs
 * Uses real rows from _data/edu_institutions.csv for the metadata join.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEduGroups, MIN_AVERAGE } from './edu-groups.js';
import { eduMetaOf } from './edu-meta.js';

const audits = {
  botability: { displayName: 'Botability', attributes: [{ key: 'status', displayName: 'Sitemap status' }] },
};
const stateNames = { TX: { name: 'Texas', slug: 'tx' }, CA: { name: 'California', slug: 'ca' } };
// `crawlable` and `ogtitle` are the fully-scanned markers isPartial() looks for.
const site = (urlkey, score, extra = {}) => ({
  urlkey, name: urlkey, status: 200, time: 1, overallScore: score,
  scores: { botability: { score } }, botability: { crawlable: true, status: score > 50 }, usability: { ogtitle: true }, ...extra,
});

test('metadata join: exact domain, then subdomain fallback to the listed root', () => {
  assert.equal(eduMetaOf({ urlkey: 'utexas.edu' }).state, 'TX');
  assert.equal(eduMetaOf({ urlkey: 'home.dartmouth.edu' }).name, eduMetaOf({ urlkey: 'dartmouth.edu' }).name);
  assert.equal(eduMetaOf({ urlkey: 'not-a-school.example' }), null);
});

test('state group: public institutions make the headline, private ones get their own section and are not averaged in', () => {
  const records = [
    site('utexas.edu', 90), site('tamu.edu', 80), site('uh.edu', 70), site('unt.edu', 60), site('ttu.edu', 50), // public 4-year
    site('austincc.edu', 40), // public 2-year
    site('rice.edu', 100), site('smu.edu', 100), // private nonprofit
  ];
  const { groups } = buildEduGroups(records, stateNames, audits);
  const tx = groups.find(g => g.kind === 'state' && g.slug === 'tx');
  assert.ok(tx, 'Texas page exists');
  assert.equal(tx.headlineCount, 6);
  assert.equal(tx.count, 8);
  assert.equal(tx.averages.overall, 65, 'public average excludes the two private 100s');
  const priv = tx.sections.find(s => s.key === 'private');
  assert.equal(priv.count, 2);
  assert.equal(priv.averages.overall, 100);
  assert.equal(priv.inHeadline, false);
  assert.equal(tx.hasAverage, true);
});

test('a headline population under MIN_AVERAGE gets a page but no average or rank', () => {
  const records = [site('utexas.edu', 90), site('tamu.edu', 80)];
  const { groups } = buildEduGroups(records, stateNames, audits);
  const tx = groups.find(g => g.kind === 'state' && g.slug === 'tx');
  assert.ok(tx);
  assert.ok(tx.scoredCount < MIN_AVERAGE);
  assert.equal(tx.hasAverage, false);
  assert.equal(tx.rank.overall, null);
  assert.equal(tx.kindCount, 0);
});

test('system group: the system office is listed in its own section and left out of the average', () => {
  const uc = ['berkeley.edu', 'ucla.edu', 'ucsd.edu', 'ucdavis.edu', 'uci.edu', 'ucsb.edu'].map(u => site(u, 80));
  const records = [...uc, site('ucop.edu', 0)];
  const { groups } = buildEduGroups(records, stateNames, audits);
  const sys = groups.find(g => g.kind === 'system' && /university-of-california/.test(g.slug));
  assert.ok(sys, 'UC system page exists');
  assert.equal(sys.averages.overall, 80, 'office score 0 not averaged');
  const office = sys.sections.find(s => s.key === 'office');
  assert.equal(office.count, 1);
  assert.equal(office.inHeadline, false);
});

test('sites with no metadata row are counted as unknown and appear in no group', () => {
  const { groups, unknownCount } = buildEduGroups([site('nobody.example', 50)], stateNames, audits);
  assert.equal(unknownCount, 1);
  assert.equal(groups.filter(g => g.kind === 'state').length, 0);
});
