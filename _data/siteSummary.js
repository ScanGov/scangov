// Aggregates and chart specs over every site on the list, for Pulse and the
// homepage. Default export only.

import { default as domainData } from './domains.js';
import { loadAudits } from '../scripts/load-audits.js';
import { buildGroupSummary } from '../scripts/group-summary.js';

export default async function () {
    const audits = await loadAudits();
    return buildGroupSummary(domainData(), audits, {
        idBase: 'all',
        groupTitle: 'U.S. government',
        groupText: 'fully scanned U.S. government sites',
        // Pulse nests each failures chart under an h2 section and an h3
        // indicator heading, so the chart title takes h4.
        failuresHeadingLevel: 4,
    });
}
