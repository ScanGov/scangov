// County classification and ranking helpers.
//
// Shared by _data/variables.js (which builds countyDomainList from changelog
// records shaped { url, name }) and scripts/county-states.js (which works on
// audit records shaped { urlkey, name, scores, ... }), so every function
// accepts either shape.
//
// Pure functions only: nothing here reads data files or mutates its input.

// County equivalents: Louisiana parishes, Alaska boroughs, and the Connecticut
// planning regions that replaced its counties in 2022.
export const COUNTY_NAME_RE = /\b(County|Parish|Borough|Planning Region)\b/;

// County-list sites whose record name carries no county keyword: consolidated
// city-counties, Alaska's unified municipalities, Virginia's independent
// cities, and two real counties named without the word. Values are the state
// code, used when the name has no ", XX" suffix. Source of truth for the list
// is the county CSV behind county-viz (data/raw/county-bot-blocking-*.csv);
// rerun the check there when the county list changes.
export const COUNTY_EXCEPTIONS = {
    'hennepincounty.gov': 'MN',
    'jocogov.org': 'KS',
    'tulsacounty.org': 'OK',
    'sf.gov': 'CA',
    'denvergov.org': 'CO',
    'broomfield.org': 'CO',
    'baltimorecity.gov': 'MD',
    'stlouis-mo.gov': 'MO',
    'carsoncity.gov': 'NV',
    'nantucket-ma.gov': 'MA',
    'fredericksburgva.gov': 'VA',
    'ci.staunton.va.us': 'VA',
    'nortonva.gov': 'VA',
    'muni.org': 'AK',
    'juneau.org': 'AK',
    'cityofsitka.com': 'AK',
    'skagway.org': 'AK',
    'wrangell.com': 'AK',
    'yakutatak.us': 'AK',
};

const STATE_SUFFIX_RE = /,\s*([A-Z]{2})$/;

export const TOPICS = ['accessibility', 'botability', 'security', 'usability'];

export function domainKey(d) {
    return d.urlkey || d.url || '';
}

// Community colleges like "Collin County Community College District" match
// the county keyword, so the .edu exclusion comes first.
export function isCounty(d) {
    const key = domainKey(d);
    if (key.endsWith('.edu')) return false;
    if (key in COUNTY_EXCEPTIONS) return true;
    return COUNTY_NAME_RE.test(d.name || '');
}

export function stateCodeOf(d) {
    const m = STATE_SUFFIX_RE.exec((d.name || '').trim());
    if (m) return m[1];
    return COUNTY_EXCEPTIONS[domainKey(d)] || null;
}

// A record counts as responding when the homepage returned 200 and was scored.
export function isResponding(d) {
    return d.status === 200 && !!d.scores && Number.isFinite(d.overallScore);
}

export function scoreOf(d, topic) {
    if (!topic || topic === 'overall') return Number.isFinite(d.overallScore) ? d.overallScore : null;
    const s = d.scores && d.scores[topic];
    return s && Number.isFinite(s.score) ? s.score : null;
}

// Partial scan: the site answered the request but did not return page
// content to the scanner, so the content-derived checks were never scored
// and the site reads higher than a full scan would. The signature in the data
// is the absence of the botability text-content check and of every Open Graph
// check in usability (2026-09 review: 165 of 2,588 responding counties).
//
// Counting checks is not a substitute: a site with no sitemap lacks the
// sitemap checks, a site with no www variant lacks that check, and Lighthouse
// only reports the accessibility audits that apply. None of those is a
// partial scan.
export function isPartial(d) {
    const bot = d.botability || {};
    const use = d.usability || {};
    const hasContentCheck = 'text-content' in bot;
    const hasOpenGraph = 'ogtitle' in use || 'ogdescription' in use;
    return !hasContentCheck || !hasOpenGraph;
}

// Dense ranking: ties share a rank and the next distinct score gets the next
// integer, the same rule as addRankingPosition in _data/variables.js, but
// returned as a Map keyed by domain instead of written onto the records.
export function rankDense(list, score) {
    const sorted = [...list].sort((a, b) => score(b) - score(a));
    const ranks = new Map();
    let rank = 0;
    let prev = null;
    for (const item of sorted) {
        const s = score(item);
        if (s !== prev) {
            rank++;
            prev = s;
        }
        ranks.set(domainKey(item), rank);
    }
    return ranks;
}

// Same thresholds as the gradify filter in eleventy.config.js.
export function gradeOf(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

// Same buckets as the colorVar filter: the CSS custom property suffix that
// carries a grade's color. Grades share buckets (A: success, B and C: warning,
// D and F: danger), so any legend built on these must say so in text.
export function statusColorOf(score) {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    if (score >= 0) return 'danger';
    return 'inaccessible';
}

export const GRADE_BUCKETS = [
    { key: 'A', label: 'A (90 to 100)', grades: ['A'], color: 'success' },
    { key: 'BC', label: 'B to C (70 to 89)', grades: ['B', 'C'], color: 'warning' },
    { key: 'DF', label: 'D to F (below 70)', grades: ['D', 'F'], color: 'danger' },
];

export function mean(values) {
    const nums = values.filter(Number.isFinite);
    if (!nums.length) return null;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export function ordinal(n) {
    const rem100 = n % 100;
    if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
    switch (n % 10) {
        case 1: return `${n}st`;
        case 2: return `${n}nd`;
        case 3: return `${n}rd`;
        default: return `${n}th`;
    }
}
