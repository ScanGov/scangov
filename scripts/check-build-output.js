#!/usr/bin/env node
// Did the build produce the pages the data says it should? Run after the
// shards are merged (deploy workflow) or after `npm run build` locally.
//
// The sitemap check (check-sitemap-completeness.js) asks whether every built
// page is listed. This asks the other direction, and about volume:
//   1. every URL the sitemap lists exists in _site/  (a shard that rendered
//      nothing, or a shard the merge missed, fails here: the profiles sitemap
//      is generated from data, not from built pages)
//   2. each sitemap section lists at least as many pages as the data has
//      entries for (content/build-manifest.njk, written by the core build)
//   3. the pages kept out of the sitemap are all there: every profile view
//      once per domain, and every status page
//   4. no rendered page contains the strings a template emits when its data
//      was missing: "undefined", "NaN", "null", "[object Object]"
//
// Everything is a directory walk or a file read; no page is re-rendered.
//
// Usage: node scripts/check-build-output.js [siteDir]   (default _site)
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ciAnnotate } from './ci-annotate.js';

export const MANIFEST = 'data/build-manifest.json';
// Markers of a template rendering missing data. Anchored to a tag boundary or
// a unit so inline JavaScript that legitimately mentions `undefined` passes.
export const BAD_TEXT = /\>(undefined|NaN|null)\<|NaN%|\[object Object\]|\/undefined\//;
const MAX_LISTED = 25;

function walk(dir, keep, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, keep, out);
    else if (keep(p)) out.push(p);
  }
  return out;
}

// Every <loc> path across the sitemap index and its child sitemaps.
function sitemapPaths(siteDir) {
  const root = join(siteDir, 'sitemap.xml');
  if (!existsSync(root)) return null;
  const xml = readFileSync(root, 'utf8');
  const docs = /<sitemapindex[\s>]/.test(xml)
    ? [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => {
        const child = join(siteDir, new URL(m[1]).pathname);
        return existsSync(child) ? readFileSync(child, 'utf8') : '';
      })
    : [xml];
  return docs.flatMap((doc) => [...doc.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname));
}

const countPrefix = (paths, prefix) => paths.filter((p) => p.startsWith(prefix)).length;
// Directories directly under <siteDir>/<rel> that hold an index.html.
const countPages = (siteDir, rel) => {
  const dir = join(siteDir, rel);
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((d) => existsSync(join(dir, d, 'index.html'))).length;
};

export function checkBuildOutput(siteDir = '_site') {
  const errors = [];
  const stats = {};

  const manifestPath = join(siteDir, MANIFEST);
  if (!existsSync(manifestPath)) {
    errors.push(`${MANIFEST} not found: the core build did not write it (content/build-manifest.njk)`);
    return { errors, stats };
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!(manifest.domains > 0)) errors.push(`manifest lists ${manifest.domains} domains`);

  const listed = sitemapPaths(siteDir);
  if (!listed) {
    errors.push('sitemap.xml not found');
    return { errors, stats };
  }
  stats.sitemapUrls = listed.length;

  // 1. Every listed URL was built.
  const notBuilt = listed.filter((p) => p.endsWith('/') && !existsSync(join(siteDir, p, 'index.html')));
  if (notBuilt.length) {
    errors.push(`${notBuilt.length} of ${listed.length} sitemap URLs have no index.html`, ...notBuilt.slice(0, MAX_LISTED).map((p) => `  ${p}`));
  }

  // 2. Each section lists at least what the data calls for. Profiles are
  // exact: the sitemap and the manifest come from the same domain list.
  const expect = (label, actual, wanted, exact = false) => {
    stats[label] = actual;
    const ok = exact ? actual === wanted : actual >= wanted;
    if (!ok) errors.push(`${label}: ${actual} built, expected ${exact ? '' : 'at least '}${wanted}`);
  };
  expect('sitemap /profile/', countPrefix(listed, '/profile/'), manifest.domains, true);
  expect('sitemap /org/', countPrefix(listed, '/org/'), manifest.orgPages);
  expect('sitemap /rankings/counties/', countPrefix(listed, '/rankings/counties/'), manifest.countyStates + manifest.countyStateTopics);
  expect('sitemap /rankings/edu/', countPrefix(listed, '/rankings/edu/'), manifest.eduGroupPages);
  expect('sitemap /issues/', countPrefix(listed, '/issues/'), manifest.issuePagesListed);

  // 3. Pages outside the sitemap: one of each profile view per domain, every status page.
  const profileDir = join(siteDir, 'profile');
  const profiles = existsSync(profileDir) ? readdirSync(profileDir).filter((d) => statSync(join(profileDir, d)).isDirectory()) : [];
  for (const view of manifest.profileViews || []) {
    const built = profiles.filter((d) => existsSync(join(profileDir, d, view, 'index.html'))).length;
    expect(`profile ${view} pages`, built, manifest.domains, true);
  }
  const statusDir = join(siteDir, 'status');
  const statusPages = existsSync(statusDir)
    ? walk(statusDir, (f) => f.endsWith('index.html')).length - (existsSync(join(statusDir, 'index.html')) ? 1 : 0)
    : 0;
  expect('status pages', statusPages, manifest.statusPages, true);

  // 4. No page rendered its missing data as text.
  const html = walk(siteDir, (f) => f.endsWith('.html'));
  stats.htmlFiles = html.length;
  const bad = [];
  for (const f of html) {
    const m = BAD_TEXT.exec(readFileSync(f, 'utf8'));
    if (m) bad.push(`${relative(siteDir, f)}: "${m[0]}"`);
  }
  if (bad.length) {
    errors.push(`${bad.length} page(s) contain undefined/NaN/null/[object Object] text`, ...bad.slice(0, MAX_LISTED).map((b) => `  ${b}`));
  }

  return { errors, stats, manifest };
}

const isMainModule = process.argv[1] && process.argv[1].includes('check-build-output');
if (isMainModule) {
  const siteDir = process.argv[2] || '_site';
  const started = Date.now();
  const { errors, stats } = checkBuildOutput(siteDir);
  const summary = Object.entries(stats).map(([k, v]) => `${k}=${v}`).join(', ');
  if (errors.length) {
    ciAnnotate('error', `check-build-output: ${siteDir} is missing expected pages`, errors);
    process.exit(1);
  }
  console.log(`check-build-output: OK (${summary}) in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}
