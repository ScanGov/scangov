// One entry per issue page (scripts/issues.js), for content/issues/issue.html
// and the links to those pages from the hubs and Pulse. Default export only:
// a named export would make Eleventy paginate the module's export names.

import { default as domainData } from './domains.js';
import stateNames from './stateNames.json' with { type: 'json' };
import countyGeo from './countyGeo.json' with { type: 'json' };
import { loadAudits } from '../scripts/load-audits.js';
import { buildIssuePages } from '../scripts/issues.js';

export default async function () {
    const audits = await loadAudits();
    return buildIssuePages(domainData(), audits, stateNames, countyGeo);
}
