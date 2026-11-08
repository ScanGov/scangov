// Education peer groups (notes/plans/24): every college and university site
// grouped the ways the people who run them compare themselves. One builder,
// buildEduGroups(), returns every group of every kind with the same shape, so
// one template (_includes/edu-group.html) renders them all:
//
//   state        every institution in a state or territory; headline figures
//                cover the public ones (4-year and 2-year sections), private
//                nonprofit institutions have their own section and average
//   system       a university or college system with MIN_SYSTEM members; the
//                system office is listed but kept out of the average
//   metro        R1 and R2 universities in a Census metro with MIN_METRO members
//   research     R1 and R2 universities by state, MIN_RESEARCH_STATE members
//   list         national lists: all R1/R2, HBCUs, liberal arts, faith-related,
//                largest, land-grant, tribal, Ivy League, service academies
//   conference   NCAA primary conference with MIN_CONFERENCE members
//
// Membership comes from the IPEDS metadata in _data/edu_institutions.csv
// (scripts/edu-meta.js). Populations follow scripts/group-summary.js: a site
// is fully scanned (scored) when it responded with page content, and every
// average, distribution, share and rank uses fully scanned sites only. A
// group whose headline population has fewer than MIN_AVERAGE fully scanned
// sites gets its page and table but no average or rank.

import { isResponding, isPartial, scoreOf, rankDense, domainKey, mean } from './counties.js';
import { topicKeysFrom, allTopicKeysFrom } from './topics.js';
import { isScored, attributeIndex, summarize, scanWindow, topicLabel, failuresSubtitle, linkFailuresToIssues } from './group-summary.js';
import { gradeDistributionSpec, topicAveragesSpec, topFailuresSpec, areaSpec } from './charts/specs.js';
import { rankedCopies } from './county-states.js';
import { eduMetaOf } from './edu-meta.js';
import { issueHrefFor } from './issues.js';
import { slugify } from './charts/format.js';

export const MIN_AVERAGE = 5;
export const MIN_SYSTEM = 5;
export const MIN_CONFERENCE = 5;
export const MIN_METRO = 3;
export const MIN_RESEARCH_STATE = 3;
const TOP_SITES = 3;

// IPEDS covers these too; stateNames.json (the 50 states and DC, which the
// map can draw) does not, so they appear in tables but not on the map.
export const TERRITORIES = {
    PR: 'Puerto Rico', GU: 'Guam', VI: 'U.S. Virgin Islands', AS: 'American Samoa',
    MP: 'Northern Mariana Islands', MH: 'Marshall Islands', PW: 'Palau', FM: 'Micronesia',
};

const isResearch = m => /^Research/.test(m.institution_type || '');
const isPublic = m => m.control === 'Public';
const isPrivate = m => m.control === 'Private nonprofit';
const isSystemOffice = m => m.institution_type === 'System office / administrative unit';
const hasList = (m, name) => (m.lists || '').split(';').includes(name);

// National lists: slug, copy, and the membership test on a metadata row.
export const LISTS = [
    { slug: 'research', titleBase: 'Research university websites', name: 'Research universities', noun: 'research university sites', test: isResearch, intro: 'Every R1 and R2 university on our list, the Carnegie 2021 doctoral universities with high or very high research activity.' },
    { slug: 'hbcu', titleBase: 'HBCU websites', name: 'HBCUs', noun: 'HBCU sites', test: m => m.hbcu === 'Yes', intro: 'Historically Black colleges and universities, as designated in IPEDS.' },
    { slug: 'liberal-arts', titleBase: 'Liberal arts college websites', name: 'Liberal arts colleges', noun: 'liberal arts college sites', test: m => /^Baccalaureate:/.test(m.carnegie_2021 || ''), intro: 'Colleges in the Carnegie 2021 baccalaureate classes (arts and sciences, and diverse fields).' },
    { slug: 'faith-related', titleBase: 'Faith-related college websites', name: 'Faith-related colleges', noun: 'faith-related college sites', test: m => /Faith-Related/.test(m.carnegie_2021 || ''), intro: 'Institutions in the Carnegie 2021 special focus class for faith-related education: seminaries, Bible colleges, and rabbinical schools.' },
    { slug: 'largest', titleBase: 'Largest university websites', name: 'Largest universities', noun: 'sites of universities with 20,000 or more students', test: m => m.enrollment_size === '20,000+', intro: 'Institutions with 20,000 or more students, the top IPEDS enrollment band.' },
    { slug: 'land-grant', titleBase: 'Land-grant university websites', name: 'Land-grant universities', noun: 'land-grant university sites', test: m => m.land_grant === 'Yes', intro: 'The land-grant institutions designated under the Morrill Acts and later legislation, as flagged in IPEDS.' },
    { slug: 'tribal', titleBase: 'Tribal college websites', name: 'Tribal colleges', noun: 'tribal college sites', test: m => m.tribal === 'Yes', intro: 'Tribal colleges and universities, as designated in IPEDS.' },
    { slug: 'ivy-league', titleBase: 'Ivy League websites', name: 'Ivy League', noun: 'Ivy League sites', test: m => hasList(m, 'ivy-league'), intro: 'The eight Ivy League universities.' },
    { slug: 'service-academies', titleBase: 'Service academy websites', name: 'Service academies', noun: 'service academy sites', test: m => hasList(m, 'service-academy'), intro: 'The federal service academies.' },
];

export const KINDS = {
    state: { label: 'By state', plural: 'states and territories', intro: 'Every college and university site in one state, with public institutions ranked and private nonprofit institutions listed separately.' },
    system: { label: 'By system', plural: 'systems', intro: 'Campuses of one university or community college system. Members often share a web platform, so one page points at many fixes.' },
    metro: { label: 'Research universities by metro', plural: 'metro areas', intro: 'R1 and R2 universities in one Census metropolitan area, public and private together.' },
    research: { label: 'Research universities by state', plural: 'states', intro: 'R1 and R2 universities in one state.' },
    list: { label: 'National lists', plural: 'lists', intro: 'Institutions that share a designation, ranked nationally.' },
    conference: { label: 'By athletic conference', plural: 'conferences', intro: 'Members of one NCAA primary conference, from the NCAA membership directory.' },
};

function byKey(records, keyOf) {
    const map = new Map();
    for (const d of records) {
        const key = keyOf(d);
        if (!key) continue;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(d);
    }
    return map;
}

// Averages over one list of records (no distribution), for section lines.
function averagesOf(records, topics) {
    const scored = records.filter(isScored);
    const averages = {};
    for (const t of topics) {
        const scores = scored.map(d => scoreOf(d, t)).filter(Number.isFinite);
        averages[t] = scores.length ? mean(scores) : null;
    }
    return { scoredCount: scored.length, averages };
}

function buildCharts(group, national, audits) {
    const TOPICS = topicKeysFrom(audits);
    const ALL_TOPICS = allTopicKeysFrom(audits);
    const idBase = `edu-${group.kind}-${group.slug}`;
    const respondingText = `${group.scoredCount} fully scanned ${group.headlineNoun}`;
    const charts = { failures: {}, area: {}, grades: {} };
    const headlineScored = group.headlineRecords.filter(isScored);
    for (const topic of ALL_TOPICS) {
        const label = topic === 'overall' ? 'overall' : topicLabel(audits, topic).toLowerCase();
        charts.grades[topic] = gradeDistributionSpec({
            id: `${idBase}-grades-${topic}`,
            title: `${group.name} by ${label} grade, compared with all education sites`,
            subtitle: `Share of fully scanned sites in each grade band. ${group.name}: ${group.scoredCount} sites. All education: ${national.scoredCount} sites.`,
            groups: [
                { key: group.slug, label: group.shortName, distribution: group.gradeDistribution[topic], total: group.scoredCount },
                { key: 'edu', label: 'All education sites', href: '/rankings/edu/', distribution: national.gradeDistribution[topic], total: national.scoredCount },
            ],
        });
        const points = headlineScored.map(d => ({ label: d.name, value: scoreOf(d, topic) })).filter(p => Number.isFinite(p.value));
        charts.area[topic] = areaSpec({
            id: `${idBase}-area-${topic}`,
            title: `How ${group.shortName} ${label} scores are distributed`,
            subtitle: `Smoothed distribution of the ${respondingText}, score 0 to 100. Height shows how many sites score near each value.`,
            points, bins: group.histogram[topic],
            markers: [
                { label: `${group.shortName} average`, value: group.averages[topic] },
                { label: 'All education average', value: national.averages[topic] },
            ],
        });
    }
    for (const topic of TOPICS) {
        const label = topicLabel(audits, topic).toLowerCase();
        charts.failures[topic] = topFailuresSpec({
            id: `${idBase}-fails-${topic}`,
            title: `Most common ${label} failures among ${group.headlineNoun}`,
            subtitle: failuresSubtitle(respondingText, group.topFailures[topic]),
            headingLevel: 2,
            failures: group.topFailures[topic],
            respondingCount: group.scoredCount,
        });
    }
    charts.topics = topicAveragesSpec({
        id: `${idBase}-topics`,
        title: `${group.shortName} average score by indicator, compared with all education sites`,
        subtitle: `Average of the ${respondingText}, score 0 to 100. The comparison covers ${national.scoredCount} fully scanned education sites.`,
        topics: TOPICS.map(t => ({ key: t, label: topicLabel(audits, t) })),
        averages: group.averages, benchmarks: national.averages,
        seriesLabel: group.shortName, benchmarkLabel: 'All education',
        hrefFor: topic => `/rankings/edu/${group.path}${topic}/`,
    });
    return charts;
}

// One group from its definition and records. `sections` is
// [{ key, label, records, inHeadline, note }] in display order; headline
// figures come from the inHeadline sections.
function makeGroup(def, sections, ctx) {
    const { attrIndex, ALL_TOPICS, nationalRanks, national, audits, issueHref } = ctx;
    const filled = sections.filter(s => s.records.length);
    const headlineRecords = filled.filter(s => s.inHeadline).flatMap(s => s.records);
    const members = filled.flatMap(s => s.records);
    const responding = headlineRecords.filter(isResponding);
    const scored = headlineRecords.filter(isScored);
    const group = {
        kind: def.kind,
        kindLabel: KINDS[def.kind].label,
        slug: def.slug,
        path: def.path,
        url: `/rankings/edu/${def.path}`,
        name: def.name,
        shortName: def.shortName || def.name,
        headlineNoun: def.headlineNoun,
        scopeNoun: def.scopeNoun || def.headlineNoun,
        intro: def.intro || '',
        titleBase: def.titleBase || null,
        count: members.length,
        headlineCount: headlineRecords.length,
        respondingCount: responding.length,
        partialCount: responding.length - scored.length,
        scoredCount: scored.length,
        hasAverage: scored.length >= MIN_AVERAGE,
        minAverage: MIN_AVERAGE,
        scanWindow: scanWindow(members),
        headlineRecords,
        ...summarize(scored, attrIndex),
    };
    linkFailuresToIssues(group.topFailures, issueHref);
    group.sections = filled.map(s => {
        const byTopic = {};
        for (const topic of ALL_TOPICS) byTopic[topic] = rankedCopies(s.records, topic, nationalRanks[topic]);
        const own = averagesOf(s.records, ALL_TOPICS);
        return {
            key: s.key, label: s.label, inHeadline: !!s.inHeadline, note: s.note || '',
            count: s.records.length, scoredCount: own.scoredCount, averages: own.averages,
            hasAverage: own.scoredCount >= MIN_AVERAGE, byTopic,
        };
    });
    group.top3 = {};
    for (const topic of ALL_TOPICS) {
        group.top3[topic] = rankedCopies(headlineRecords, topic, nationalRanks[topic]).filter(d => Number.isFinite(d.score)).slice(0, TOP_SITES);
    }
    group.charts = scored.length ? buildCharts(group, national, audits) : null;
    return group;
}

export function buildEduGroups(records, stateNames, audits) {
    const ALL_TOPICS = allTopicKeysFrom(audits);
    const attrIndex = attributeIndex(audits);
    const scoredAll = records.filter(isScored);
    const nationalRanks = {};
    for (const topic of ALL_TOPICS) nationalRanks[topic] = rankDense(scoredAll, d => scoreOf(d, topic));
    const national = {
        count: records.length,
        scoredCount: scoredAll.length,
        ...summarize(scoredAll, attrIndex),
    };
    const ctx = { attrIndex, ALL_TOPICS, nationalRanks, national, audits, issueHref: issueHrefFor('edu') };

    const meta = new Map();
    let unknownCount = 0;
    for (const d of records) {
        const m = eduMetaOf(d);
        if (m) meta.set(domainKey(d), m); else unknownCount++;
    }
    const withMeta = records.filter(d => meta.has(domainKey(d)));
    const metaOf = d => meta.get(domainKey(d));
    const groups = [];

    // States and territories.
    const stateName = code => (stateNames[code] && stateNames[code].name) || TERRITORIES[code] || null;
    for (const [code, list] of byKey(withMeta, d => metaOf(d).state)) {
        const name = stateName(code);
        if (!name) { unknownCount += list.length; continue; }
        const slug = stateNames[code] ? stateNames[code].slug : code.toLowerCase();
        const pub = list.filter(d => isPublic(metaOf(d)));
        groups.push(makeGroup({
            kind: 'state', slug, path: `${slug}/`, name, code, onMap: !!stateNames[code],
            headlineNoun: `${name} public college sites`, scopeNoun: `${name} college and university sites`,
            intro: `Public colleges and universities in ${name} are ranked and averaged together; private nonprofit institutions are listed below with their own average.`,
        }, [
            { key: 'public-4', label: `${name} public 4-year institutions`, records: pub.filter(d => metaOf(d).level === '4-year'), inHeadline: true },
            { key: 'public-2', label: `${name} public 2-year institutions`, records: pub.filter(d => metaOf(d).level !== '4-year'), inHeadline: true },
            { key: 'private', label: `${name} private nonprofit institutions`, records: list.filter(d => isPrivate(metaOf(d))), inHeadline: false, note: 'Ranked among themselves. Not part of the public average above.' },
            { key: 'other', label: `Other ${name} institutions`, records: list.filter(d => !isPublic(metaOf(d)) && !isPrivate(metaOf(d))), inHeadline: false },
        ], ctx));
    }

    // Systems.
    for (const [name, list] of byKey(withMeta, d => metaOf(d).system_name)) {
        if (list.length < MIN_SYSTEM) continue;
        const slug = slugify(name);
        groups.push(makeGroup({
            kind: 'system', slug, path: `system/${slug}/`, name, shortName: name,
            headlineNoun: `${name} campus sites`, scopeNoun: `${name} sites`,
            intro: `Campuses of the ${name}. The system office site is listed but not averaged, since it is not a campus homepage.`,
        }, [
            { key: 'campuses', label: `${name} campuses`, records: list.filter(d => !isSystemOffice(metaOf(d))), inHeadline: true },
            { key: 'office', label: 'System office', records: list.filter(d => isSystemOffice(metaOf(d))), inHeadline: false, note: 'Not part of the average.' },
        ], ctx));
    }

    // Research universities by metro and by state, and the national lists.
    const research = withMeta.filter(d => isResearch(metaOf(d)));
    for (const [cbsa, list] of byKey(research, d => metaOf(d).cbsa)) {
        if (list.length < MIN_METRO) continue;
        const name = metaOf(list[0]).cbsa_name || cbsa;
        const slug = slugify(name);
        groups.push(makeGroup({
            kind: 'metro', slug, path: `metro/${slug}/`, name: `${name} research universities`, shortName: name,
            headlineNoun: `${name} research university sites`,
            intro: `R1 and R2 universities in the ${name} metropolitan area, public and private together. Metro boundaries follow the Census definition, so a page can cross state lines.`,
        }, [{ key: 'all', label: `Research universities in ${name}`, records: list, inHeadline: true }], ctx));
    }
    for (const [code, list] of byKey(research, d => metaOf(d).state)) {
        if (list.length < MIN_RESEARCH_STATE) continue;
        const name = stateName(code);
        if (!name) continue;
        const slug = stateNames[code] ? stateNames[code].slug : code.toLowerCase();
        groups.push(makeGroup({
            kind: 'research', slug, path: `research/${slug}/`, name: `${name} research universities`, shortName: name,
            headlineNoun: `${name} research university sites`,
            intro: `R1 and R2 universities in ${name}, public and private together.`,
        }, [{ key: 'all', label: `Research universities in ${name}`, records: list, inHeadline: true }], ctx));
    }
    for (const def of LISTS) {
        const list = withMeta.filter(d => def.test(metaOf(d)));
        if (!list.length) continue;
        groups.push(makeGroup({
            kind: 'list', slug: def.slug, path: `${def.slug}/`, name: def.name, shortName: def.name, titleBase: def.titleBase,
            headlineNoun: def.noun, intro: def.intro,
        }, [{ key: 'all', label: def.name, records: list, inHeadline: true }], ctx));
    }

    // Conferences.
    for (const [name, list] of byKey(withMeta, d => metaOf(d).conference)) {
        if (list.length < MIN_CONFERENCE) continue;
        const slug = slugify(name);
        const division = metaOf(list[0]).ncaa_division;
        groups.push(makeGroup({
            kind: 'conference', slug, path: `conference/${slug}/`, name, shortName: name,
            headlineNoun: `${name} member sites`,
            intro: `Members of the ${name}${division ? ` (NCAA Division ${division})` : ''}, from the NCAA membership directory. Conferences change membership every year; this list follows the directory's current academic year.`,
        }, [{ key: 'all', label: `${name} members`, records: list, inHeadline: true }], ctx));
    }

    // Rank within each kind on every topic, among groups with an average.
    for (const kind of Object.keys(KINDS)) {
        const ofKind = groups.filter(g => g.kind === kind);
        ofKind.sort((a, b) => a.name.localeCompare(b.name));
        const ranked = ofKind.filter(g => g.hasAverage);
        for (const g of ofKind) { g.rank = {}; g.kindCount = ranked.length; }
        for (const topic of ALL_TOPICS) {
            const sorted = ranked.filter(g => Number.isFinite(g.averages[topic])).sort((a, b) => b.averages[topic] - a.averages[topic]);
            let rank = 0, prev = null;
            sorted.forEach(g => { if (g.averages[topic] !== prev) { rank++; prev = g.averages[topic]; } g.rank[topic] = rank; });
            for (const g of ofKind) if (!(topic in g.rank)) g.rank[topic] = null;
        }
        ofKind.forEach((g, i) => {
            g.prev = i > 0 ? { name: ofKind[i - 1].name, path: ofKind[i - 1].path } : null;
            g.next = i < ofKind.length - 1 ? { name: ofKind[i + 1].name, path: ofKind[i + 1].path } : null;
        });
    }

    return { groups, national, unknownCount };
}

// Memoized on the record list identity so every data file shares one build.
let memo = null;
export function eduGroupsFor(records, stateNames, audits) {
    if (memo && memo.records === records) return memo.result;
    const result = buildEduGroups(records, stateNames, audits);
    memo = { records, result };
    return result;
}
