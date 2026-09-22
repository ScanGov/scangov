// One summary per rankings group, in display order, for Pulse's group
// comparisons. Each entry is a scripts/group-summary.js summary plus a label,
// slug and hub URL. Default export only.

import { default as stateData } from './states.js';
import { default as countyData } from './counties.js';
import { default as cityData } from './cities.js';
import { default as federalData } from './federal.js';
import { default as eduData } from './edu.js';
import { loadAudits } from '../scripts/load-audits.js';
import { buildGroupSummary } from '../scripts/group-summary.js';

const GROUPS = [
    { key: 'states', label: 'States', singular: 'state', hub: '/rankings/states/', data: stateData, groupTitle: 'U.S. state', groupText: 'fully scanned U.S. state sites' },
    { key: 'counties', label: 'Counties', singular: 'county', hub: '/rankings/counties/', data: countyData, groupTitle: 'U.S. county', groupText: 'fully scanned U.S. county sites' },
    { key: 'cities', label: 'Cities', singular: 'city', hub: '/rankings/cities/', data: cityData, groupTitle: 'U.S. city', groupText: 'fully scanned U.S. city sites' },
    { key: 'federal', label: 'Federal', singular: 'federal', hub: '/rankings/federal/', data: federalData, groupTitle: 'federal', groupText: 'fully scanned federal sites' },
    { key: 'edu', label: 'Education', singular: 'education', hub: '/rankings/edu/', data: eduData, groupTitle: 'education', groupText: 'fully scanned education sites' },
];

export default async function () {
    const audits = await loadAudits();
    return GROUPS.map(g => ({
        key: g.key,
        label: g.label,
        singular: g.singular,
        hub: g.hub,
        ...buildGroupSummary(g.data(), audits, { idBase: `group-${g.key}`, groupTitle: g.groupTitle, groupText: g.groupText }),
    }));
}
