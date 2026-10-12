import { default as domainData } from './domains.js';
import { loadAudits } from '../scripts/load-audits.js';
import { topicKeysFrom } from '../scripts/topics.js';

export default async function () {
  const audits = await loadAudits();

  const lookup = {};
  for (const [key, val] of Object.entries(audits)) {
    lookup[key] = {};
    for (const attr of (val.attributes || [])) {
      if (attr.key) lookup[key][attr.key] = attr.displayName;
      if (attr.scorekey) lookup[key][attr.scorekey] = attr.displayName;
    }
  }

  const domains = domainData().filter(d => d.status === 200);
  const indicators = topicKeysFrom(audits);
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
      .slice(0, 5);
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
    indicatorColors[key] = (audits[key] && audits[key].color) || '#dee2e6';
  }

  // Light-mode bar colors for the Chart.js charts on the pulse pages (the
  // dark ones are the audits.json icon pastels). Readability matches
  // --sg-indicator-readability in scangov.css.
  const indicatorColorsLight = {
    accessibility: '#1d4e9a',
    botability: '#4d7c00',
    security: '#a85000',
    usability: '#7b3fa0',
    readability: '#c2185b',
  };

  return { charts, totalDomains: domains.length, gradeDistribution, passRates, indicatorColors, indicatorColorsLight, indicatorLabels: lookup };
}
