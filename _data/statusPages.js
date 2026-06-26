import { readFileSync } from 'fs';
import { getData } from '../scripts/getdata.js';

const PAGE_SIZE = 100;

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

  const pages = [];
  for (const def of statusDefs) {
    const allDomains = (byCode[def.code] || []).sort((a, b) => a.urlkey.localeCompare(b.urlkey));
    const count = allDomains.length;
    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

    for (let i = 0; i < totalPages; i++) {
      pages.push({
        ...def,
        domains: allDomains.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
        count,
        pageNum: i,
        totalPages,
      });
    }
  }

  return pages;
}
