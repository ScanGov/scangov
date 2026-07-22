import { readFileSync } from 'fs';
import { cityDomainList, stateDomainList, countyDomainList, eduDomainList } from './variables.js';

const topics = ['botability', 'accessibility', 'usability', 'security'];

// domains.js truncates to ~54 domains in dev/serve mode to keep local builds fast (most of that
// cost is rendering one page per domain, which doesn't apply here - this only computes averages).
// Reading the full dataset directly keeps per-category averages meaningful in local dev too,
// instead of "averaging" a single domain for categories like states/edu that only get one
// guaranteed example in the truncated set.
function domainData() {
    return JSON.parse(readFileSync('./public/data/myscangov_homepage_audits.json', 'utf8'));
}

function average(domains, getValue) {
    let values = domains.map(getValue).filter(v => typeof v === 'number' && !isNaN(v));
    if (values.length === 0) return null;
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function summarize(domains) {
    let usable = domains.filter(d => d.status === 200);
    let summary = { overall: average(usable, d => d.overallScore) };
    topics.forEach(topic => {
        summary[topic] = average(usable, d => d.scores?.[topic]?.score);
    });
    return summary;
}

export default function () {
    let allDomains = domainData();

    let cityMap = new Map(cityDomainList.map(l => [l, l]));
    let stateMap = new Map(stateDomainList.map(l => [l, l]));
    let countyMap = new Map(countyDomainList.map(l => [l, l]));
    let eduMap = new Map(eduDomainList.map(l => [l, l]));

    let cities = allDomains.filter(d => cityMap.get(d.urlkey));
    let states = allDomains.filter(d => stateMap.get(d.urlkey));
    let counties = allDomains.filter(d => countyMap.get(d.urlkey));
    let edu = allDomains.filter(d => eduMap.get(d.urlkey));
    let federal = allDomains.filter(d => !cityMap.get(d.urlkey) && !stateMap.get(d.urlkey) && !countyMap.get(d.urlkey) && !eduMap.get(d.urlkey));

    return {
        all: summarize(allDomains),
        cities: summarize(cities),
        states: summarize(states),
        federal: summarize(federal),
        counties: summarize(counties),
        edu: summarize(edu),
    };
}
