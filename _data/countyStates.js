// Per-state county rankings: one entry per state that has county records,
// sorted by state name. Feeds content/rankings/counties/state.html. See
// scripts/county-states.js for the shape and the population definitions.
//
// Default export only: a named export here would make Eleventy paginate
// over the module's export names instead of this array.

import { default as domainData } from './domains.js';
import stateNames from './stateNames.json' with { type: 'json' };
import countyGeo from './countyGeo.json' with { type: 'json' };
import { countyStatesFor } from '../scripts/county-states.js';
import { loadAudits } from '../scripts/load-audits.js';

export default async function () {
    const audits = await loadAudits();
    return countyStatesFor(domainData(), stateNames, audits, countyGeo).states;
}
