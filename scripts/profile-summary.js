// Text and JSON-LD for profile, org, and rankings pages. Pure functions so
// the directory data files (content/*/*.11tydata.js) stay small and testable.
// scangov.org scans homepages only; wording here must not claim a site scan.
//
// The topic list comes from audits.json (scripts/topics.js): every function
// that names topics takes the `audits` object, and falls back to the four
// long-standing topics when it is not given.

import { topicKeysFrom, topicSentence } from './topics.js';

const DATASET_URL = 'https://data.scangov.org/datasets/homepage-audits/';
const CATALOG = { '@type': 'DataCatalog', name: 'ScanGov Data', url: 'https://data.scangov.org/' };
const LICENSE = 'https://creativecommons.org/licenses/by/4.0/';
// "Accessibility, botability, security, and usability"
function topicsCapitalized(audits) {
  const s = topicSentence(audits);
  return s[0].toUpperCase() + s.slice(1);
}

// isPartOf points at the parent dataset, which is fully described at DATASET_URL.
// It carries @id so Google treats it as that same entity rather than a new one on
// every profile page, and a description because Dataset requires one - without it
// Search Console flags one invalid Dataset per page.
function parentDataset(audits) {
  return {
    '@type': 'Dataset',
    '@id': DATASET_URL,
    name: 'ScanGov homepage audits',
    description: `${topicsCapitalized(audits)} scan results for United States government website homepages, published as open data by ScanGov.`,
    url: DATASET_URL,
  };
}

export function gradeThis(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function formatDate(ms) {
  if (!ms) return '';
  return new Date(ms).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: 'long', day: 'numeric' });
}

export function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function scanned(domain) {
  return domain && domain.status === 200 && typeof domain.overallScore === 'number';
}

function topicGrade(domain, topic) {
  const score = domain.scores?.[topic]?.score;
  return typeof score === 'number' ? gradeThis(score) : '-';
}

// One sentence per profile view so the three indexable subpages are not
// near-duplicates of each other.
export function describeProfile(domain, view, audits) {
  const name = domain.urlkey || domain.url;
  const date = formatDate(domain.time);
  const when = date ? ` Homepage scanned ${date}.` : '';
  if (!scanned(domain)) {
    const status = domain.status ? ` (HTTP ${domain.status})` : '';
    return `${name} could not be scanned by Project ScanGov${status}.${when} Grades return when the homepage responds.`;
  }
  const overall = gradeThis(domain.overallScore);
  const topics = topicSentence(audits);
  // Only the topics this record was graded on, in topic order.
  const grades = topicKeysFrom(audits)
    .filter((t) => typeof domain.scores?.[t]?.score === 'number')
    .map((t) => `${topicGrade(domain, t)} ${((audits?.[t] && audits[t].displayName) || t).toLowerCase()}`)
    .join(', ');
  switch (view) {
    case 'pulse':
      return `How ${name} ${topics} grades have changed over time on Project ScanGov. Currently ${overall} overall.${when}`;
    case 'changelog':
      return `Standards ${name} started passing or failing between Project ScanGov scans, newest first. Currently ${overall} overall.${when}`;
    case 'details':
      return `Every ${topics} standard ${name} passes or fails on Project ScanGov, with how to fix each one. ${overall} overall.${when}`;
    case 'report':
      return `Printable Project ScanGov report card for ${name}: ${overall} overall, ${grades}.${when}`;
    default:
      return `${name} scores ${overall} overall on Project ScanGov: ${grades}.${when}`;
  }
}

export function describeOrg(org, view, audits) {
  const domains = org.domains || [];
  const scoredDomains = domains.filter(scanned);
  const avg = scoredDomains.length ? Math.round(scoredDomains.reduce((sum, d) => sum + d.overallScore, 0) / scoredDomains.length) : null;
  const count = `${domains.length} government website${domains.length === 1 ? '' : 's'}`;
  const grade = avg === null ? '' : `, average grade ${gradeThis(avg)}`;
  const examples = domains.slice(0, 3).map((d) => d.urlkey).join(', ');
  if (view === 'pulse') {
    return `How the ${count} managed by ${org.name} have changed over time on Project ScanGov${grade}. Includes ${examples}.`;
  }
  return `${count} managed by ${org.name} on Project ScanGov${grade}: ${examples}. ${topicsCapitalized(audits)} grades for each.`;
}

// Median overallScore across a list of domains, ignoring unscanned ones.
export function medianScore(domains) {
  const scores = domains.filter(scanned).map((d) => d.overallScore).sort((a, b) => a - b);
  if (!scores.length) return null;
  const mid = Math.floor(scores.length / 2);
  return scores.length % 2 ? scores[mid] : Math.round((scores[mid - 1] + scores[mid]) / 2);
}

// Up to `limit` failing standards, in topic order, with display names from
// audits.json and a link to the standard's page.
export function failingStandards(domain, audits, limit = 3) {
  const out = [];
  for (const topic of topicKeysFrom(audits)) {
    const attrs = domain.scores?.[topic]?.attributes || {};
    for (const [key, passed] of Object.entries(attrs)) {
      if (passed) continue;
      const def = (audits?.[topic]?.attributes || []).find((a) => a.key === key || a.scorekey === key);
      out.push({ key, topic, name: def?.displayName || key, url: `https://standards.scangov.org/${slugify(key)}/` });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export function compareWord(score, median) {
  if (median === null || median === undefined) return '';
  if (score > median) return 'above';
  if (score < median) return 'below';
  return 'level with';
}

// Data for the summary paragraph on the profile overview page.
export function summarizeProfile(domain, audits, medians, category) {
  if (!scanned(domain)) return null;
  const topics = topicKeysFrom(audits);
  const passed = topics.reduce((n, t) => n + (domain.scores?.[t]?.correct || 0), 0);
  const total = topics.reduce((n, t) => n + (domain.scores?.[t]?.all || 0), 0);
  return {
    grade: gradeThis(domain.overallScore),
    score: domain.overallScore,
    passed,
    total,
    category,
    categoryMedian: medians?.[category] ?? null,
    categoryCompare: compareWord(domain.overallScore, medians?.[category]),
    nationalMedian: medians?.all ?? null,
    nationalCompare: compareWord(domain.overallScore, medians?.all),
    failing: failingStandards(domain, audits, 3),
    date: formatDate(domain.time),
  };
}

function breadcrumb(siteUrl, crumbs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: siteUrl + url })),
  };
}

// `context` (scripts/site-context.js) adds the group hub and, for counties,
// the state page to the breadcrumb so it matches the visible links.
export function profileSchema(domain, view, siteUrl, pageUrl, context, audits) {
  const name = domain.urlkey || domain.url;
  const base = `/profile/${slugify(name)}/`;
  const crumbs = [['Home', '/'], ['Rankings', '/rankings/']];
  if (context?.hubUrl) crumbs.push([`${context.categoryLabel[0].toUpperCase()}${context.categoryLabel.slice(1)} rankings`, context.hubUrl]);
  if (context?.statePageUrl) crumbs.push([context.stateName, context.statePageUrl]);
  crumbs.push([name, `${base}overall/`]);
  if (view && view !== 'overview') crumbs.push([view.charAt(0).toUpperCase() + view.slice(1), pageUrl]);
  const graph = [breadcrumb(siteUrl, crumbs)];
  if (scanned(domain)) {
    graph.push({
      '@type': 'Dataset',
      name: `Project ScanGov scan results for ${name}`,
      description: describeProfile(domain, 'overview', audits),
      url: siteUrl + pageUrl,
      ...(domain.time ? { dateModified: new Date(domain.time).toISOString() } : {}),
      license: LICENSE,
      creator: { '@type': 'Organization', name: 'ScanGov', url: 'https://scangov.com' },
      includedInDataCatalog: CATALOG,
      isPartOf: parentDataset(audits),
      // Only the topics this record was graded on.
      variableMeasured: topicKeysFrom(audits)
        .filter((t) => typeof domain.scores?.[t]?.score === 'number')
        .map((t) => ({ '@type': 'PropertyValue', name: `${t} score`, value: domain.scores[t].score })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function orgSchema(org, view, siteUrl, pageUrl) {
  const domains = org.domains || [];
  const base = `/org/${slugify(org.name)}/`;
  const crumbs = [['Home', '/'], ['Rankings', '/rankings/'], [org.name, base]];
  if (view === 'pulse') crumbs.push(['Pulse', pageUrl]);
  const isEdu = domains.length > 0 && domains.every((d) => (d.urlkey || '').endsWith('.edu'));
  const first = domains[0];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb(siteUrl, crumbs),
      {
        '@type': isEdu ? 'EducationalOrganization' : 'GovernmentOrganization',
        name: org.name,
        ...(first ? { url: first.redirect || first.requestedUrl || `https://${first.urlkey}/` } : {}),
        subjectOf: { '@type': 'WebPage', url: siteUrl + pageUrl },
      },
    ],
  };
}

export function rankingsSchema(members, title, description, siteUrl, pageUrl, updatedIso, audits) {
  const list = (members || []).slice(0, 100);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb(siteUrl, [['Home', '/'], ['Rankings', '/rankings/'], [title, pageUrl]]),
      {
        '@type': 'Dataset',
        name: `Project ScanGov ${title}`,
        description,
        url: siteUrl + pageUrl,
        ...(updatedIso ? { dateModified: updatedIso } : {}),
        license: LICENSE,
        creator: { '@type': 'Organization', name: 'ScanGov', url: 'https://scangov.com' },
        includedInDataCatalog: CATALOG,
        isPartOf: parentDataset(audits),
      },
      {
        '@type': 'ItemList',
        name: title,
        numberOfItems: list.length,
        itemListElement: list.map((d, i) => ({
          '@type': 'ListItem',
          position: d.rank || i + 1,
          name: d.urlkey,
          url: `${siteUrl}/profile/${slugify(d.urlkey)}/overall/`,
        })),
      },
    ],
  };
}

// JSON-LD is dropped straight into a <script> block, so keep "<" out of it.
export function toJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}
