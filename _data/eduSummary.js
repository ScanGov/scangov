// Aggregates and chart specs for the education hub (/rankings/edu/ and its
// topic pages). Default export only.

import { default as eduData } from './edu.js';
import { loadAudits } from '../scripts/load-audits.js';
import { buildGroupSummary } from '../scripts/group-summary.js';
import { issueHrefFor } from '../scripts/issues.js';

export default async function () {
    const audits = await loadAudits();
    return buildGroupSummary(eduData(), audits, {
        idBase: 'edu',
        groupTitle: 'education',
        groupText: 'fully scanned education sites',
        issueHref: issueHrefFor('edu'),
    });
}
