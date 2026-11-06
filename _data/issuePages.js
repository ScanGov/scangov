// One entry per issue page (scripts/issues.js), for content/issues/issue.html
// and the links to those pages from the hubs, Pulse and /issues/. Groups are
// the six homepage groups: counties come from the shared classifier, cities,
// states and education from the domain lists in variables.js, federal is
// everything else. Default export only: a named export would make Eleventy
// paginate the module's export names.

import { default as domainData } from './domains.js';
import { cityDomainList, stateDomainList, eduDomainList } from './variables.js';
import stateNames from './stateNames.json' with { type: 'json' };
import countyGeo from './countyGeo.json' with { type: 'json' };
import { loadAudits } from '../scripts/load-audits.js';
import { buildIssuePages, buildGroups } from '../scripts/issues.js';

export default async function () {
    const audits = await loadAudits();
    const groups = buildGroups({
        cities: new Set(cityDomainList),
        states: new Set(stateDomainList),
        edu: new Set(eduDomainList),
    });
    return buildIssuePages(domainData(), audits, stateNames, countyGeo, groups);
}
