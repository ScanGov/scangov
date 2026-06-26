import { readFileSync } from 'fs';
import { getData } from '../scripts/getdata.js';

export default async function () {
  const url = 'https://github.com/ScanGov/data/raw/refs/heads/main/status.json';
  const local = process.env.ELEVENTY_RUN_MODE === 'serve';
  const statusDefs = await getData(url, local);

  const domains = JSON.parse(readFileSync('./public/data/myscangov_homepage_audits.json', 'utf8'));

  const byCode = {};
  for (const d of domains) {
    if (!byCode[d.status]) byCode[d.status] = [];
    byCode[d.status].push(d);
  }

  return statusDefs.map(def => ({
    ...def,
    domains: (byCode[def.code] || []).sort((a, b) => a.urlkey.localeCompare(b.urlkey)),
    count: (byCode[def.code] || []).length,
  }));
}
