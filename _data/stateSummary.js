// Aggregates and chart specs for the state rankings hub (/rankings/states/
// and its topic pages): the 50 state sites plus DC. Default export only.

import { default as stateData } from './states.js';
import { loadAudits } from '../scripts/load-audits.js';
import { buildGroupSummary } from '../scripts/group-summary.js';

export default async function () {
    const audits = await loadAudits();
    return buildGroupSummary(stateData(), audits, {
        idBase: 'states',
        groupTitle: 'U.S. state',
        groupText: 'fully scanned U.S. state sites',
    });
}
