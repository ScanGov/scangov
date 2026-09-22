// Aggregates and chart specs for the city rankings hub (/rankings/cities/
// and its topic pages). Default export only.

import { default as cityData } from './cities.js';
import { loadAudits } from '../scripts/load-audits.js';
import { buildGroupSummary } from '../scripts/group-summary.js';

export default async function () {
    const audits = await loadAudits();
    return buildGroupSummary(cityData(), audits, {
        idBase: 'cities',
        groupTitle: 'U.S. city',
        groupText: 'fully scanned U.S. city sites',
    });
}
