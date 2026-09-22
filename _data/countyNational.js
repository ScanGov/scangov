// National county aggregates for the county hub pages (/rankings/counties/
// and its topic pages): counts, averages, grade distribution, histogram, and
// the most-failed checks across every county on the list. Shares the
// memoized build with countyStates.js. Default export only (see that file).

import { default as domainData } from './domains.js';
import stateNames from './stateNames.json' with { type: 'json' };
import countyGeo from './countyGeo.json' with { type: 'json' };
import { countyStatesFor } from '../scripts/county-states.js';
import { loadAudits } from '../scripts/load-audits.js';

export default async function () {
    const audits = await loadAudits();
    return countyStatesFor(domainData(), stateNames, audits, countyGeo).national;
}
