// State outlines colored by the average score of the public college and
// university sites in each state, for the education hub
// (_includes/edu-charts.html via report-map.html) and its social image
// (scripts/og-map.js). Same shape as countyStateMap.js; the figures are the
// state groups' headline averages (scripts/edu-groups.js), so the map, the
// hub table and the state page headline agree. Each state links to its page.

import { statePaths } from '../scripts/state-paths.js';
import { default as eduData } from './edu.js';
import stateNames from './stateNames.json' with { type: 'json' };
import { loadAudits } from '../scripts/load-audits.js';
import { allTopicKeysFrom } from '../scripts/topics.js';
import { eduGroupsFor } from '../scripts/edu-groups.js';

export default async function () {
    const audits = await loadAudits();
    const TOPICS = allTopicKeysFrom(audits);
    const states = eduGroupsFor(eduData(), stateNames, audits).groups.filter(g => g.kind === 'state');
    const byName = new Map(states.map(s => [s.name, s]));
    const range = {};
    for (const t of TOPICS) {
        const vals = states.filter(s => s.hasAverage).map(s => s.averages[t]).filter(Number.isFinite);
        range[t] = vals.length ? { min: Math.min(...vals), max: Math.max(...vals) } : { min: 0, max: 100 };
    }
    return statePaths.map(entry => {
        const stateName = entry.name.replace(/^State of /, '');
        const st = byName.get(stateName);
        const scores = {};
        for (const t of TOPICS) scores[t] = st && st.hasAverage && Number.isFinite(st.averages[t]) ? st.averages[t] : -1;
        return {
            url: st ? st.slug : stateName,
            name: entry.name,
            label: st ? `${st.name}: ${st.scoredCount} fully scanned public college sites` : `${stateName}: no college sites on our list`,
            href: st ? st.url : '/rankings/edu/#by-state',
            status: st && st.hasAverage ? 200 : 0,
            path: entry.path,
            scores,
            range,
        };
    });
}
