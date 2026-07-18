#!/usr/bin/env node
// Confirms every page Eleventy actually builds ends up in sitemap.xml, unless
// its own frontmatter explicitly opts out via `eleventyExcludeFromCollections:
// true`, `addAllPagesToCollections: false`, or `sitemap: false` — or unless
// it's a numbered listing page (pagination with no custom per-item
// `permalink:`, e.g. /rankings/accessibility/2/), which is deliberately
// excluded: thin, mostly-duplicate pages most sites keep out of a sitemap on
// purpose, a different category from the actual bug this checks for.
//
// A page missing for any other reason almost always means a per-item
// `pagination` block (one page per distinct entity, with its own
// `permalink:`) forgot `addAllPagesToCollections: true` — that flag controls
// whether every generated page (not just the first) gets registered in
// `collections.all`, which is what sitemap.xml loops over. Run this after
// `npm run build`.
//
// Primary strategy: `--to=ndjson` gives every page Eleventy processed,
// regardless of collection membership, with each page's source `inputPath` —
// the only reliable way to see pages a forgotten flag silently dropped, and
// to check that page's own frontmatter for an intentional exclusion. Some
// repos have a custom `.11ty.js` template that crashes Eleventy's `--to=json`/
// `--to=ndjson` modes (a circular-reference bug in Eleventy's own template-map
// serialization, unrelated to this script) — if that happens, this falls back
// to walking `_site/` directly and matching against a statically-resolved
// exclusion list, which only handles literal (non-templated) permalinks. That
// covers every case seen so far, but a future per-item pagination block with
// a templated permalink AND a crash-triggering repo would need a real fix to
// the underlying Eleventy crash, not another workaround here.

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, unlinkSync, createReadStream, readdirSync, statSync } from 'node:fs';
import { createInterface } from 'node:readline';
import path from 'node:path';
import os from 'node:os';

// Repo-local override: URL prefixes this check should never evaluate, for
// cases where this repo's own sitemap template includes/excludes pages via
// bespoke logic outside Eleventy's collections/frontmatter-flag system (e.g.
// data's sitemap.njk filters datasets by a data-driven `experimental` flag).
// Empty here — no such case in this repo today.
const LOCAL_IGNORE_PREFIXES = [];

function readFrontmatterBlock(inputPath) {
  if (!inputPath || !existsSync(inputPath)) return '';
  const raw = readFileSync(inputPath, 'utf8');
  if (inputPath.endsWith('.11ty.js') || inputPath.endsWith('.11ty.cjs')) {
    const match = raw.match(/export const data\s*=\s*\{([\s\S]*?)\n\}/);
    return match ? match[1] : '';
  }
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : '';
}

function isIntentionallyExcluded(frontmatter) {
  return /eleventyExcludeFromCollections:\s*true/.test(frontmatter)
    || /addAllPagesToCollections:\s*false/.test(frontmatter)
    || /(^|\n)\s*sitemap:\s*false/.test(frontmatter);
}

function isNumberedListingPage(frontmatter) {
  if (!/(^|\n)pagination:\s*\n/.test(frontmatter)) return false;

  const permalinkMatch = frontmatter.match(/(^|\n)\s*permalink:\s*(.+)/);
  if (!permalinkMatch) return true; // no override at all -> Eleventy's default /pagenum/ pages

  const aliasMatch = frontmatter.match(/(^|\n)\s*alias:\s*(\S+)/);
  if (!aliasMatch) return true; // pagination with no alias can't address a per-item value anyway

  // Per-item pagination (the real bug category) interpolates the alias itself
  // into the permalink, e.g. permalink: "map/states/{{ topic | lower }}/".
  // Some listing pages write out a permalink explicitly but only reference
  // pagination's own built-in pageNumber (e.g. rankings/cities/index.html) —
  // that's still a numbered listing, not a per-item page, despite having a
  // "permalink:" line.
  const alias = aliasMatch[2];
  const permalinkValue = permalinkMatch[2];
  const referencesAlias =
    new RegExp(`\\{\\{\\s*${alias}(\\.\\w+)?`).test(permalinkValue) ||
    new RegExp(`\\{%.*\\b${alias}\\b`).test(permalinkValue);
  return !referencesAlias;
}

function walkFiles(dir, filterFn) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) results.push(...walkFiles(full, filterFn));
    else if (filterFn(full)) results.push(full);
  }
  return results;
}

async function checkViaNdjson(siteRoot, sitemapPaths) {
  const ndjsonFile = path.join(os.tmpdir(), `eleventy-pages-${Date.now()}.ndjson`);
  execSync(`npx @11ty/eleventy --to=ndjson > "${ndjsonFile}"`, {
    cwd: siteRoot,
    stdio: ['ignore', 'ignore', 'inherit'],
  });

  const missing = [];
  let total = 0;

  // Read line-by-line — the full ndjson dump (rendered HTML content included
  // for every page) is too large to load as a single string on big sites.
  const rl = createInterface({ input: createReadStream(ndjsonFile, 'utf8'), crlfDelay: Infinity });
  for await (const line of rl) {
    // Skip anything that isn't a JSON object line — build hooks (e.g. data
    // fetches in eleventy.config.js) can print their own status lines to
    // stdout, landing in the same file as the real --to=ndjson output.
    if (!line || line[0] !== '{') continue;
    const page = JSON.parse(line);
    if (!page.url) continue; // permalink: false or non-HTML output
    if (LOCAL_IGNORE_PREFIXES.some((prefix) => page.url.startsWith(prefix))) continue;
    total++;
    if (sitemapPaths.has(page.url)) continue;
    const frontmatter = readFrontmatterBlock(page.inputPath);
    if (isIntentionallyExcluded(frontmatter)) continue;
    if (isNumberedListingPage(frontmatter)) continue;
    missing.push({ url: page.url, inputPath: page.inputPath });
  }
  unlinkSync(ndjsonFile);

  return { missing, total };
}

function checkViaFilesystemWalk(siteRoot, sitemapPaths) {
  // Build a static exclusion set: every content template with an exclusion
  // flag and a literal (non-templated) permalink. Doesn't handle templated
  // permalinks (e.g. redirects.njk's "{{ redirect.from }}") — none of the
  // repos that need this fallback have that combination today.
  const contentDir = path.join(siteRoot, 'content');
  const contentFiles = walkFiles(contentDir, (f) => /\.(html|njk|md|11ty\.js)$/.test(f));
  const exclusionUrls = new Set();
  for (const f of contentFiles) {
    const block = readFrontmatterBlock(f);
    if (!isIntentionallyExcluded(block)) continue;
    const match = block.match(/permalink:\s*['"]?([^\s'",{}]+)['"]?/);
    if (!match) continue;
    const value = match[1];
    if (value.includes('{{') || value.includes('{%')) continue; // can't resolve statically
    exclusionUrls.add(value.startsWith('/') ? value : `/${value}`);
  }

  // Every directory under _site/ containing an index.html is one built page.
  // Undercounts non-HTML permalink output (robots.txt, sitemap.xml, etc.),
  // but every such file in the repos that hit this fallback already carries
  // an exclusion flag, so it doesn't affect the missing-page result.
  const siteDir = path.join(siteRoot, '_site');
  const builtIndexFiles = walkFiles(siteDir, (f) => path.basename(f) === 'index.html');

  const missing = [];
  let total = 0;
  for (const f of builtIndexFiles) {
    const rel = path.relative(siteDir, path.dirname(f));
    const url = rel ? `/${rel}/` : '/';
    if (LOCAL_IGNORE_PREFIXES.some((prefix) => url.startsWith(prefix))) continue;
    total++;
    if (sitemapPaths.has(url) || exclusionUrls.has(url)) continue;
    missing.push({ url, inputPath: '(unknown — fallback mode, per-page source attribution unavailable)' });
  }

  return { missing, total };
}

const siteRoot = process.cwd();
const sitemapPath = path.join(siteRoot, '_site', 'sitemap.xml');

if (!existsSync(sitemapPath)) {
  console.error(`check-sitemap-completeness: ${sitemapPath} not found — run "npm run build" first.`);
  process.exit(1);
}

const sitemapXml = readFileSync(sitemapPath, 'utf8');
const sitemapPaths = new Set(
  [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
);

let missing, total;
try {
  ({ missing, total } = await checkViaNdjson(siteRoot, sitemapPaths));
} catch (err) {
  console.error(
    'check-sitemap-completeness: "--to=ndjson" failed for this repo (likely a custom template ' +
      'incompatible with Eleventy\'s JSON output modes) — falling back to a filesystem-walk check ' +
      'with reduced precision.\n'
  );
  ({ missing, total } = checkViaFilesystemWalk(siteRoot, sitemapPaths));
}

if (missing.length > 0) {
  console.error(`\ncheck-sitemap-completeness: ${missing.length} page(s) built but missing from sitemap.xml:\n`);
  for (const m of missing) console.error(`  ${m.url}  (from ${m.inputPath})`);
  console.error(
    '\nIf this is a per-item "pagination" block, it likely needs "addAllPagesToCollections: true".'
  );
  console.error(
    'If these pages should genuinely be excluded, add "eleventyExcludeFromCollections: true", ' +
      '"addAllPagesToCollections: false", or "sitemap: false" to their frontmatter instead.\n'
  );
  process.exit(1);
}

console.log(`check-sitemap-completeness: OK — all ${total} built pages accounted for in sitemap.xml.`);
