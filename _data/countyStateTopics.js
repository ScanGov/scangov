// One entry per state and indicator, for content/rankings/counties/state-topic.html.
// Shares the memoized build with countyStates.js.

import { default as domainData } from './domains.js';
import stateNames from './stateNames.json' with { type: 'json' };
import countyGeo from './countyGeo.json' with { type: 'json' };
import { countyStatesFor } from '../scripts/county-states.js';
import { loadAudits } from '../scripts/load-audits.js';
import { TOPICS } from '../scripts/counties.js';

export default async function () {
    const audits = await loadAudits();
    const { states } = countyStatesFor(domainData(), stateNames, audits, countyGeo);
    const items = [];
    for (const state of states) {
        for (const topic of TOPICS) {
            items.push({ state, topic, topicInfo: audits[topic] || { displayName: topic[0].toUpperCase() + topic.slice(1) } });
        }
    }
    return items;
}
