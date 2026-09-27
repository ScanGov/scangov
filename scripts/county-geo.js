// Join scanned county sites to the county boundaries in _data/countyGeo.json.
//
// Shared by scripts/county-states.js (one state at a time) and
// scripts/issues.js (the whole country at once) so both maps place a site on
// the same boundary. Join by domain first, from the county list the geometry
// was built from, then by normalized county name within the state for sites
// whose domain changed since. A boundary takes the first site that matches
// it; later matches count as unjoined.
//
// Pure functions: nothing here reads files or mutates its input.

import { domainKey, stateCodeOf } from './counties.js';

export function normalizeCountyName(name) {
    return String(name || '').toLowerCase().replace(/\bsaint\b/g, 'st').replace(/[^a-z0-9]+/g, ' ').trim();
}

// FIPS lookup by normalized name for one state's boundaries.
export function nameIndexFor(stateGeo) {
    const byName = new Map();
    for (const [fips, c] of Object.entries(stateGeo.counties)) {
        if (c.name) byName.set(normalizeCountyName(c.name), fips);
    }
    return byName;
}

// The FIPS code of the boundary a site record belongs to, or null.
export function fipsFor(d, geo, code, byName) {
    const stateGeo = geo.states[code];
    if (!stateGeo) return null;
    let fips = geo.byDomain[domainKey(d).toLowerCase()];
    if (!fips || !stateGeo.counties[fips]) {
        fips = byName.get(normalizeCountyName((d.name || '').replace(/,\s*[A-Z]{2}$/, '')));
    }
    return fips && stateGeo.counties[fips] ? fips : null;
}

// Join a list of county records to boundaries. Records may span states; each
// is placed in the state its name carries (see stateCodeOf). Returns the
// boundary-to-record map keyed "ST:fips" and the records that found none.
export function joinCounties(records, geo) {
    const byFips = new Map();
    const unjoined = [];
    const nameIndexes = new Map();
    for (const d of records) {
        const code = stateCodeOf(d);
        const stateGeo = code && geo.states[code];
        if (!stateGeo) {
            unjoined.push(d);
            continue;
        }
        if (!nameIndexes.has(code)) nameIndexes.set(code, nameIndexFor(stateGeo));
        const fips = fipsFor(d, geo, code, nameIndexes.get(code));
        const key = `${code}:${fips}`;
        if (fips && !byFips.has(key)) {
            byFips.set(key, d);
        } else {
            unjoined.push(d);
        }
    }
    return { byFips, unjoined };
}
