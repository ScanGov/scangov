// Writes _site/bootstrap-purged.css: Bootstrap trimmed to the classes the built
// pages actually use, sampled from a handful of representative pages. Runs from
// the eleventy.after hook in a single-process build, and as a separate step after
// scripts/merge-shards.js in the sharded deploy (the sample pages come from
// different shards, so it can only run once everything is merged).
//
// Usage: node scripts/purge-css.js [siteDir]
import * as fs from 'fs';
import { join } from 'path';
import { PurgeCSS } from 'purgecss';

// Representative pages. (The old list also named sorts/accessibility, filter,
// map and report index pages that the site no longer generates.)
const SAMPLE_PAGES = [
  'assets/purge/states.html',
  'index.html',
  'changelog/index.html',
  'rankings/states/index.html',
  'profile/ca-gov/report/index.html',
];

export async function purgeCss(siteDir = '_site') {
  const content = SAMPLE_PAGES.map((p) => join(siteDir, p)).filter((p) => fs.existsSync(p));
  const missing = SAMPLE_PAGES.length - content.length;
  if (missing) console.warn(`purge-css: ${missing} sample page(s) not built; purging from ${content.length}`);
  const results = await new PurgeCSS().purge({
    content,
    css: ['public/assets/bootstrap/css/bootstrap.min.css'],
    safelist: ['alert-dismissible', 'alert-primary', 'fade', 'show', 'btn-close'],
  });
  const out = join(siteDir, 'bootstrap-purged.css');
  fs.writeFileSync(out, results[0].css, 'utf8');
  console.log(`purge-css: wrote ${out} (${results[0].css.length} bytes)`);
}

const isMainModule = process.argv[1] && process.argv[1].includes('purge-css');
if (isMainModule) {
  await purgeCss(process.argv[2] || '_site');
}
