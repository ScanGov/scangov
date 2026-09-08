// Shrinks every generated HTML page. Eleventy keeps each rendered page in memory
// for the whole build, so with ~4,200 domains x 5 profile pages the page size is
// what decides whether the build fits in RAM.
//
// 1. Font Awesome sprite: the @11ty/font-awesome plugin inlines a per-page
//    <svg style="display: none;"> block of <symbol>s (~44KB on every page). This
//    transform lifts those symbols into one shared sprite written to
//    /assets/fa-sprite.svg at the end of the build and rewrites the page's
//    <use href="#id"> references to point at it.
// 2. Indentation: strips leading whitespace and blank lines outside <pre>,
//    <textarea> and <script> blocks. The report page was ~50% indentation.

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const SPRITE_FILE = 'assets/fa-sprite.svg';
const BUNDLE_RE = /<svg style="display: none;">((?:\s*<symbol[\s\S]*?<\/symbol>)+)\s*<\/svg>/g;
const SYMBOL_RE = /<symbol[\s\S]*?<\/symbol>/g;
const PROTECTED_RE = /(<pre[\s\S]*?<\/pre>|<textarea[\s\S]*?<\/textarea>|<script[\s\S]*?<\/script>)/i;

export default function slimHtmlPlugin(eleventyConfig) {
  const symbols = new Map(); // id -> <symbol> markup, site-wide

  function spriteUrl() {
    const prefix = (eleventyConfig.pathPrefix || '/').replace(/\/$/, '');
    return `${prefix}/${SPRITE_FILE}`;
  }

  function stripIndentation(html) {
    // Split on protected blocks; only touch the parts between them.
    return html
      .split(PROTECTED_RE)
      .map((part, i) => (i % 2 === 1 ? part : part.replace(/^[ \t]+/gm, '').replace(/\n{2,}/g, '\n')))
      .join('');
  }

  eleventyConfig.addTransform('slim-html', function (content) {
    if (!(this.page?.outputPath || '').endsWith('.html') || typeof content !== 'string') return content;

    const pageIds = new Set();
    let out = content.replace(BUNDLE_RE, (_, inner) => {
      for (const sym of inner.match(SYMBOL_RE) || []) {
        const id = /\sid="([^"]+)"/.exec(sym)?.[1];
        if (!id) continue;
        pageIds.add(id);
        if (!symbols.has(id)) symbols.set(id, sym);
      }
      return '';
    });

    if (pageIds.size) {
      const url = spriteUrl();
      out = out.replace(/<use\b([^>]*)>/g, (tag, attrs) =>
        `<use${attrs.replace(/\b(xlink:href|href)="#([^"]+)"/g, (m, attr, id) => (pageIds.has(id) ? `${attr}="${url}#${id}"` : m))}>`
      );
    }

    return stripIndentation(out);
  });

  eleventyConfig.on('eleventy.after', ({ dir }) => {
    if (!symbols.size) return;
    const outPath = join(dir.output, SPRITE_FILE);
    mkdirSync(join(dir.output, 'assets'), { recursive: true });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n${[...symbols.values()].join('\n')}\n</svg>\n`;
    writeFileSync(outPath, svg, 'utf8');
    console.log(`slim-html: wrote ${symbols.size} icons to ${outPath}`);
  });
}
