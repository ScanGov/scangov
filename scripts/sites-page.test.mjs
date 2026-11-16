import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSitesPage, buildStateRows } from './sites-page.js';

const summary = { count: 10, scoredCount: 8, respondingCount: 9, partialCount: 1 };
const groups = [
  { key: 'counties', label: 'Counties', hub: '/rankings/counties/', count: 6, scoredCount: 5, averages: { overall: 76 } },
  { key: 'cities', label: 'Cities', hub: '/rankings/cities/', count: 5, scoredCount: 4, averages: { overall: null } },
];
const organizations = [
  { name: 'B Agency', domains: [1, 2] },
  { name: 'A Agency', domains: [1, 2] },
  { name: 'Big Agency', domains: [1, 2, 3, 4] },
];
const statuses = [
  { code: 200, label: 'OK', count: 8 },
  { code: 403, label: 'Forbidden', count: 1 },
  { code: 404, label: 'Not Found', count: 0 },
  { code: 500, label: 'Server error', count: 1 },
];

test('totals and the share scanned come from the summary', () => {
  const p = buildSitesPage({ summary, groups, organizations, statuses });
  assert.equal(p.total, 10);
  assert.equal(p.scored, 8);
  assert.equal(p.scoredShare, 80);
  assert.equal(p.noResponse, 1);
});

test('sites in two groups show up as an overlap', () => {
  const p = buildSitesPage({ summary, groups, organizations, statuses });
  assert.equal(p.groupsSum, 11);
  assert.equal(p.overlap, 1);
});

test('each group links to its rankings and its Pulse page', () => {
  const p = buildSitesPage({ summary, groups, organizations, statuses });
  assert.deepEqual(p.groups[0], { key: 'counties', label: 'Counties', count: 6, scored: 5, average: 76, rankings: '/rankings/counties/', pulse: '/pulse/counties/' });
  assert.equal(p.groups[1].average, null);
});

test('statuses leave out 200 and empty ones, largest first', () => {
  const p = buildSitesPage({ summary, groups, organizations, statuses });
  assert.deepEqual(p.statuses.map(s => s.code), [403, 500]);
});

test('organizations are sorted by size, then name', () => {
  const p = buildSitesPage({ summary, groups, organizations, statuses });
  assert.equal(p.organizations.count, 3);
  assert.deepEqual(p.organizations.top.map(o => o.name), ['Big Agency', 'A Agency', 'B Agency']);
});

const stateNames = { TX: { name: 'Texas', slug: 'tx' }, AL: { name: 'Alabama', slug: 'al' } };
const stateSites = [{ urlkey: 'texas.gov', name: 'State of Texas' }, { urlkey: 'alabama.gov', name: 'State of Alabama' }];

test('each state row counts its own site, counties, cities, and schools, with links', () => {
  const t = buildStateRows({
    stateNames, stateSites,
    countyStates: [{ code: 'TX', slug: 'tx', count: 3 }],
    cityStateCodes: ['TX', 'TX', 'AL'],
    eduStates: [{ name: 'Texas', count: 4, url: '/rankings/edu/tx/' }],
    federalCount: 9, eduCount: 6,
  });
  const tx = t.rows.find(r => r.code === 'TX');
  assert.deepEqual(tx, { code: 'TX', name: 'Texas', stateSite: 'texas.gov', counties: 3, countiesUrl: '/rankings/counties/tx/', cities: 2, edu: 4, eduUrl: '/rankings/edu/tx/', total: 10 });
  const al = t.rows.find(r => r.code === 'AL');
  assert.equal(al.counties, 0);
  assert.equal(al.countiesUrl, null);
  assert.equal(al.total, 2);
});

test('rows are sorted by state name and the sites outside any row are counted', () => {
  const t = buildStateRows({
    stateNames, stateSites, countyStates: [], cityStateCodes: [],
    eduStates: [{ name: 'Texas', count: 4, url: '/rankings/edu/tx/' }],
    federalCount: 9, eduCount: 6,
  });
  assert.deepEqual(t.rows.map(r => r.name), ['Alabama', 'Texas']);
  assert.deepEqual(t.unplaced, { federal: 9, edu: 2 });
  assert.equal(t.total, 1 + 1 + 4);
});
