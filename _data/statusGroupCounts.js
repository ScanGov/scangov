// Sites with each status code, by rankings group (states, counties, cities, federal,
// education), for the group chart on each status code page. A map by code to
// [{ key, label, count }]; groups with no sites with that status are left out. A site in two
// groups (a consolidated city-county) counts in both. Default export only.
import { default as stateData } from './states.js';
import { default as countyData } from './counties.js';
import { default as cityData } from './cities.js';
import { default as federalData } from './federal.js';
import { default as eduData } from './edu.js';

const GROUPS = [
    { key: 'states', label: 'States', data: stateData },
    { key: 'counties', label: 'Counties', data: countyData },
    { key: 'cities', label: 'Cities', data: cityData },
    { key: 'federal', label: 'Federal', data: federalData },
    { key: 'edu', label: 'Education', data: eduData },
];

export default function () {
    const byCode = {};
    for (const g of GROUPS) {
        const counts = {};
        for (const d of g.data()) counts[d.status] = (counts[d.status] || 0) + 1;
        for (const [code, count] of Object.entries(counts)) {
            (byCode[code] ||= []).push({ key: g.key, label: g.label, count });
        }
    }
    return byCode;
}
