import { default as domainData } from './domains.js';
import * as fs from 'fs';

export default async function () {
  let audits = {};
  try {
    if (process.env.ELEVENTY_RUN_MODE === 'serve') {
      audits = JSON.parse(fs.readFileSync('../data/standards/audits.json', 'utf8'));
    } else {
      const resp = await fetch('https://github.com/ScanGov/data/raw/refs/heads/main/standards/audits.json');
      if (resp.ok) audits = await resp.json();
    }
  } catch (e) {
    // fallback to formatted key names
  }

  const lookup = {};
  for (const [key, val] of Object.entries(audits)) {
    lookup[key] = {};
    for (const attr of (val.attributes || [])) {
      if (attr.key) lookup[key][attr.key] = attr.displayName;
      if (attr.scorekey) lookup[key][attr.scorekey] = attr.displayName;
    }
  }

  const domains = domainData().filter(d => d.status === 200);
  const indicators = ['accessibility', 'botability', 'security', 'usability'];
  const charts = {};

  for (const key of indicators) {
    const counts = {};
    for (const domain of domains) {
      if (!domain[key]) continue;
      for (const [attr, pass] of Object.entries(domain[key])) {
        if (!pass) counts[attr] = (counts[attr] || 0) + 1;
      }
    }
    charts[key] = Object.entries(counts)
      .map(([attr, failCount]) => ({
        attr,
        label: (lookup[key] && lookup[key][attr]) || attr.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
        failCount,
      }))
      .sort((a, b) => b.failCount - a.failCount)
      .slice(0, 10);
  }
  const passRates = {};
  for (const key of indicators) {
    let passing = 0, total = 0;
    for (const domain of domains) {
      const s = domain.scores && domain.scores[key];
      if (s && typeof s.score === 'number' && s.score >= 0) {
        total++;
        if (s.score >= 70) passing++;
      }
    }
    passRates[key] = total > 0 ? Math.round(passing / total * 100) : 0;
  }

  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const domain of domains) {
    const s = domain.overallScore;
    if (s >= 90) gradeDistribution.A++;
    else if (s >= 80) gradeDistribution.B++;
    else if (s >= 70) gradeDistribution.C++;
    else if (s >= 60) gradeDistribution.D++;
    else gradeDistribution.F++;
  }

  const indicatorColors = {};
  for (const key of indicators) {
    indicatorColors[key] = (audits[key] && audits[key].color) || '#fff';
  }

  return { charts, totalDomains: domains.length, gradeDistribution, passRates, indicatorColors };
}
