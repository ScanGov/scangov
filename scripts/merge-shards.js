// Merges the output directories of a sharded build (see _config/build-role.js)
// into one site directory. Plain files are copied over; the Font Awesome sprite
// (_config/slim-html.js) is special: each process only wrote the icons its own
// pages used, so the sprites are unioned by symbol id.
//
// Usage: node scripts/merge-shards.js <outDir> <inputDir> [<inputDir> ...]
//   e.g. node scripts/merge-shards.js _site shards/core shards/profiles-1 shards/profiles-2
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SPRITE = 'assets/fa-sprite.svg';

const [outDir, ...inputs] = process.argv.slice(2);
if (!outDir || !inputs.length) {
  console.error('usage: node scripts/merge-shards.js <outDir> <inputDir> [<inputDir> ...]');
  process.exit(1);
}

const symbols = new Map();
let copied = 0;
for (const input of inputs) {
  if (!existsSync(input)) {
    console.error(`merge-shards: input not found: ${input}`);
    process.exit(1);
  }
  const spritePath = join(input, SPRITE);
  if (existsSync(spritePath)) {
    for (const sym of readFileSync(spritePath, 'utf8').match(/<symbol[\s\S]*?<\/symbol>/g) || []) {
      const id = /\sid="([^"]+)"/.exec(sym)?.[1];
      if (id && !symbols.has(id)) symbols.set(id, sym);
    }
  }
  cpSync(input, outDir, {
    recursive: true,
    force: true,
    filter: (src) => !src.endsWith(SPRITE),
  });
  copied++;
  console.log(`merge-shards: merged ${input}`);
}

if (symbols.size) {
  mkdirSync(join(outDir, 'assets'), { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n${[...symbols.values()].join('\n')}\n</svg>\n`;
  writeFileSync(join(outDir, SPRITE), svg, 'utf8');
  console.log(`merge-shards: wrote ${symbols.size} icons to ${join(outDir, SPRITE)}`);
}
console.log(`merge-shards: ${copied} input(s) merged into ${outDir}`);
