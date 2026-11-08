/**
 * Post-build page-count checks. Run: node --test scripts/check-build-output.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { BAD_TEXT, MANIFEST, checkBuildOutput } from './check-build-output.js';

const SITE = 'https://scangov.org';
const views = ['overall', 'pulse', 'changelog', 'report', 'details'];

function page(root, url, body = '<html><body><h1>ok</h1></body></html>') {
  mkdirSync(join(root, url), { recursive: true });
  writeFileSync(join(root, url, 'index.html'), body);
}
function urlset(urls) {
  return `<?xml version="1.0"?><urlset>${urls.map((u) => `<url><loc>${SITE}${u}</loc></url>`).join('')}</urlset>`;
}

// A two-domain site with one org, one county state, one edu group, one issue
// page and two status pages, matching its manifest exactly.
function makeSite({ manifest = {}, skipView = null, omitProfile = null, omitChangelog = null, extraSitemap = [], badPage = null } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'scangov-site-'));
  const domains = ['a-gov', 'b-gov'];
  for (const d of domains) {
    for (const v of views) {
      if (d === omitProfile || v === skipView) continue;
      if (v === 'changelog' && d === omitChangelog) continue;
      page(root, `profile/${d}/${v}`);
    }
  }
  page(root, 'org/one');
  page(root, 'rankings/counties/texas');
  page(root, 'rankings/counties/texas/security');
  page(root, 'rankings/edu/state/tx');
  page(root, 'issues/not-dotgov/all');
  page(root, 'status');
  page(root, 'status/403');
  page(root, 'status/403/2');
  page(root, '');
  if (badPage) page(root, 'rankings', badPage);

  mkdirSync(join(root, 'data'), { recursive: true });
  writeFileSync(join(root, MANIFEST), JSON.stringify({
    domains: 2, profilePages: Object.fromEntries(views.map((v) => [v, 2])), orgPages: 1, countyStates: 1, countyStateTopics: 1,
    eduGroupPages: 1, issuePagesListed: 1, statusPages: 2, ...manifest,
  }));
  writeFileSync(join(root, 'sitemap.xml'),
    `<?xml version="1.0"?><sitemapindex>${['profiles', 'rankings', 'orgs', 'issues'].map((s) => `<sitemap><loc>${SITE}/sitemap-${s}.xml</loc></sitemap>`).join('')}</sitemapindex>`);
  writeFileSync(join(root, 'sitemap-profiles.xml'), urlset(domains.map((d) => `/profile/${d}/overall/`)));
  writeFileSync(join(root, 'sitemap-rankings.xml'), urlset(['/rankings/counties/texas/', '/rankings/counties/texas/security/', '/rankings/edu/state/tx/', ...extraSitemap]));
  writeFileSync(join(root, 'sitemap-orgs.xml'), urlset(['/org/one/']));
  writeFileSync(join(root, 'sitemap-issues.xml'), urlset(['/issues/not-dotgov/all/']));
  return root;
}

test('a complete build passes', () => {
  const root = makeSite();
  const { errors, stats } = checkBuildOutput(root);
  assert.deepEqual(errors, []);
  assert.equal(stats.sitemapUrls, 7);
  rmSync(root, { recursive: true });
});

test('a sitemap URL with no page fails (a shard that rendered nothing)', () => {
  const root = makeSite({ omitProfile: 'b-gov' });
  const { errors } = checkBuildOutput(root);
  assert.ok(errors.some((e) => /1 of 7 sitemap URLs have no index.html/.test(e)), errors.join('\n'));
  assert.ok(errors.some((e) => /profile overall pages: 1 built, expected 2/.test(e)), errors.join('\n'));
  rmSync(root, { recursive: true });
});

test('a profile view missing for every domain fails', () => {
  const root = makeSite({ skipView: 'pulse' });
  const { errors } = checkBuildOutput(root);
  assert.deepEqual(errors, ['profile pulse pages: 0 built, expected 2']);
  rmSync(root, { recursive: true });
});

test('the changelog view is counted against its own data source, not the domain list', () => {
  // Only sites with scan history get a changelog page.
  const root = makeSite({ omitChangelog: 'b-gov', manifest: { profilePages: { overall: 2, pulse: 2, changelog: 1, report: 2, details: 2 } } });
  assert.deepEqual(checkBuildOutput(root).errors, []);
  rmSync(root, { recursive: true });
});

test('fewer section pages than the data calls for fails; more is fine', () => {
  const short = makeSite({ manifest: { eduGroupPages: 5, statusPages: 3 } });
  const { errors } = checkBuildOutput(short);
  assert.deepEqual(errors, [
    'sitemap /rankings/edu/: 1 built, expected at least 5',
    'status pages: 2 built, expected 3',
  ]);
  rmSync(short, { recursive: true });

  const extra = makeSite({ extraSitemap: ['/rankings/counties/texas/security/'] });
  assert.deepEqual(checkBuildOutput(extra).errors, []);
  rmSync(extra, { recursive: true });
});

test('a page that rendered missing data as text fails', () => {
  const root = makeSite({ badPage: '<p>Grade: <b>undefined</b> (NaN%)</p>' });
  const { errors } = checkBuildOutput(root);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /1 page\(s\) contain undefined/);
  assert.match(errors[1], /rankings\/index.html: ">undefined<"/);
  rmSync(root, { recursive: true });
});

test('a missing manifest fails without walking the site', () => {
  const root = mkdtempSync(join(tmpdir(), 'scangov-site-'));
  const { errors } = checkBuildOutput(root);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /build-manifest.json not found/);
  rmSync(root, { recursive: true });
});

test('inline JavaScript that mentions undefined is not a rendering bug', () => {
  assert.equal(BAD_TEXT.test(`<script>if (typeof x === 'undefined') x = null;</script>`), false);
  assert.equal(BAD_TEXT.test('<td>null</td>'), true);
  assert.equal(BAD_TEXT.test('<a href="/profile/undefined/overall/">'), true);
  assert.equal(BAD_TEXT.test('Owner: [object Object]'), true);
});
