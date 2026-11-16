// The top five and bottom five scanned sites of each rankings group, for the
// homepage. Same ranked lists as the rankings pages (rankingPosition is already set),
// in the homepage tab order. A site that was not scanned has no grade, so it
// is left out of the bottom five. Default export only.

import { default as stateData } from './states.js';
import { default as countyData } from './counties.js';
import { default as cityData } from './cities.js';
import { default as federalData } from './federal.js';
import { default as eduData } from './edu.js';
import { isScored } from '../scripts/group-summary.js';

const GROUPS = [
    { key: 'states', label: 'States', name: 'State', hub: '/rankings/states/', data: stateData },
    { key: 'counties', label: 'Counties', name: 'County', hub: '/rankings/counties/', data: countyData },
    { key: 'cities', label: 'Cities', name: 'City', hub: '/rankings/cities/', data: cityData },
    { key: 'federal', label: 'Federal', name: 'Federal', hub: '/rankings/federal/', data: federalData },
    { key: 'edu', label: 'Education', name: 'Education', hub: '/rankings/edu/', data: eduData },
];
const SIZE = 5;

export default function () {
    return GROUPS.map(g => {
        const scored = g.data().filter(isScored);
        return {
            key: g.key,
            label: g.label,
            link: `${g.name} rankings`,
            hub: g.hub,
            top: scored.slice(0, SIZE),
            bottom: scored.slice(-SIZE),
        };
    });
}
