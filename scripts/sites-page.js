// The numbers behind /sites/ (content/sites.html), from the summaries the rest of the site
// already uses, so the page cannot disagree with the rankings and Pulse.
//
//   groups   one row per rankings group: its sites, how many were scanned, the average
//            overall score, and the links to its rankings and Pulse page
//   overlap  sites that sit in two groups (a consolidated city-county is in both the county
//            and city lists), so the groups add up to more than the total
//   statuses the scan statuses other than 200, with their site counts, for "why some sites
//            have no grade"
//   organizations  how many organizations have more than one site, and the largest ones

const TOP_ORGANIZATIONS = 15;

export function buildSitesPage({ summary, groups, organizations, statuses }) {
    const rows = groups.map(g => ({
        key: g.key,
        label: g.label,
        count: g.count,
        scored: g.scoredCount,
        average: g.averages && Number.isFinite(g.averages.overall) ? g.averages.overall : null,
        rankings: g.hub,
        pulse: `/pulse/${g.key}/`,
    }));
    const groupsSum = rows.reduce((n, r) => n + r.count, 0);
    const bySize = [...organizations]
        .map(o => ({ name: o.name, count: o.domains.length }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return {
        total: summary.count,
        scored: summary.scoredCount,
        scoredShare: summary.count ? Math.round((summary.scoredCount / summary.count) * 100) : 0,
        partial: summary.partialCount,
        noResponse: summary.count - summary.respondingCount,
        groups: rows,
        groupsSum,
        overlap: Math.max(0, groupsSum - summary.count),
        statuses: statuses
            .filter(s => s.code !== 200 && s.count > 0)
            .map(s => ({ code: s.code, label: s.label, count: s.count }))
            .sort((a, b) => b.count - a.count || a.code - b.code),
        organizations: { count: bySize.length, top: bySize.slice(0, TOP_ORGANIZATIONS) },
    };
}

// One row per state for the "Sites by state" table: the state's own site, its county sites,
// its city sites, and its public college and university sites, each linked where the site
// has a page for that list. Federal sites carry no state, and a few education sites have
// none on the list, so `unplaced` says how many are not in any row.
//
//   stateNames     { AL: { name, slug } ... } (_data/stateNames.json)
//   stateSites     the 50 "State of X" sites and the District's: { urlkey, name }
//   countyStates   the county pages: { code, slug, count }
//   cityStateCodes one state code per city site
//   eduStates      the education state groups: { name, count, url }
//   federalCount, eduCount   all federal and education sites, for `unplaced`
export function buildStateRows({ stateNames, stateSites, countyStates, cityStateCodes, eduStates, federalCount, eduCount }) {
    const byCode = new Map(Object.entries(stateNames).map(([code, s]) => [code, { code, name: s.name, slug: s.slug }]));
    const siteOf = (name) => stateSites.find(s => s.name === `State of ${name}` || s.name === name) || null;
    const counties = new Map(countyStates.map(c => [c.code, c]));
    const cities = new Map();
    for (const code of cityStateCodes) cities.set(code, (cities.get(code) || 0) + 1);
    const edu = new Map(eduStates.map(g => [g.name, g]));
    const rows = [...byCode.values()].map(st => {
        const county = counties.get(st.code);
        const school = edu.get(st.name);
        const site = siteOf(st.name);
        const row = {
            code: st.code,
            name: st.name,
            stateSite: site ? site.urlkey : null,
            counties: county ? county.count : 0,
            countiesUrl: county ? `/rankings/counties/${county.slug}/` : null,
            cities: cities.get(st.code) || 0,
            edu: school ? school.count : 0,
            eduUrl: school ? school.url : null,
        };
        row.total = (row.stateSite ? 1 : 0) + row.counties + row.cities + row.edu;
        return row;
    }).sort((a, b) => a.name.localeCompare(b.name));
    const eduPlaced = rows.reduce((n, r) => n + r.edu, 0);
    return {
        rows,
        total: rows.reduce((n, r) => n + r.total, 0),
        unplaced: { federal: federalCount, edu: Math.max(0, eduCount - eduPlaced) },
    };
}
