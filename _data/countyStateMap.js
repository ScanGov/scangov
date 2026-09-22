// State outlines colored by the average county score in each state, for the
// county hub (_includes/county-charts.html via report-map.html). Uses the
// shared outlines in scripts/state-paths.js (keyed "State of Texas") joined
// to countyStates by state name, so it does not depend on which state sites
// are in the build. States with no county sites on the list carry -1 scores
// and status 0, which the map paints as no data.

import { statePaths } from '../scripts/state-paths.js';
import { default as domainData } from './domains.js';
import stateNames from './stateNames.json' with { type: 'json' };
import countyGeo from './countyGeo.json' with { type: 'json' };
import { countyStatesFor } from '../scripts/county-states.js';
import { loadAudits } from '../scripts/load-audits.js';

const TOPICS = ['overall', 'accessibility', 'botability', 'security', 'usability'];

export default async function () {
    const audits = await loadAudits();
    const { states } = countyStatesFor(domainData(), stateNames, audits, countyGeo);
    const byName = new Map(states.map(s => [s.name, s]));
    // Range of averages per topic across states with data, for the sequential
    // scale in report-map.html (carried on every entry; the include reads [0]).
    const range = {};
    for (const t of TOPICS) {
        const vals = states.filter(s => s.scoredCount).map(s => s.averages[t]).filter(Number.isFinite);
        range[t] = vals.length ? { min: Math.min(...vals), max: Math.max(...vals) } : { min: 0, max: 100 };
    }
    return statePaths.map(entry => {
        const stateName = entry.name.replace(/^State of /, '');
        const st = byName.get(stateName);
        const scores = {};
        for (const t of TOPICS) scores[t] = st && st.scoredCount ? st.averages[t] : -1;
        return {
            url: st ? st.slug : stateName,
            name: entry.name,
            label: st ? `${st.name}: ${st.scoredCount} fully scanned county sites` : `${stateName}: no county sites on our list`,
            href: st ? `/rankings/counties/${st.slug}/` : '/rankings/counties/',
            status: st && st.scoredCount ? 200 : 0,
            path: entry.path,
            scores,
            range,
        };
    });
}
