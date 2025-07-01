import * as fs from 'fs';

export default function () {

  let scanData = JSON.parse(fs.readFileSync('./public/data/myscangov_homepage_audits.json','utf8'));
  if (process.env.ELEVENTY_RUN_MODE === 'serve')
    scanData = scanData.slice(0, 50);

  return scanData;
}
