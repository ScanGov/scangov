// Every education peer group (scripts/edu-groups.js) as one array, plus
// `byKind` for the hub's directory, `unknownCount` for the footnote and
// `national` for comparisons. Default export only.

import { default as eduData } from './edu.js';
import stateNames from './stateNames.json' with { type: 'json' };
import { loadAudits } from '../scripts/load-audits.js';
import { eduGroupsFor, KINDS } from '../scripts/edu-groups.js';

export default async function () {
    const audits = await loadAudits();
    const { groups, national, unknownCount } = eduGroupsFor(eduData(), stateNames, audits);
    const byKind = {};
    for (const kind of Object.keys(KINDS)) byKind[kind] = groups.filter(g => g.kind === kind);
    return { groups, byKind, kinds: KINDS, national, unknownCount };
}
