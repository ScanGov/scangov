// City sites as points on the national map (_includes/city-map.html):
// coordinates from city_locs.json projected onto the 975 x 610 plane of the
// state outlines in countyGeo.json. Sites without coordinates are left out
// of the map and appear only in the table.

import { default as cityData } from './cities.js';
import cityLocs from './city_locs.json' with { type: 'json' };
import countyGeo from './countyGeo.json' with { type: 'json' };
import { albersUsa } from '../scripts/albers-usa.js';
import { isResponding, isPartial, scoreOf } from '../scripts/counties.js';

const TOPICS = ['overall', 'accessibility', 'botability', 'security', 'usability'];

export default function () {
    const project = albersUsa();
    const byUrl = new Map(cityLocs.map(l => [l.url, l]));
    const points = [];
    let missing = 0;
    for (const d of cityData()) {
        const loc = byUrl.get(d.urlkey);
        if (!loc || !Number.isFinite(loc.lat) || !Number.isFinite(loc.long)) { missing++; continue; }
        const [x, y] = project(loc.long, loc.lat);
        const scored = isResponding(d) && !isPartial(d);
        const scores = {};
        for (const t of TOPICS) scores[t] = scored ? scoreOf(d, t) : -1;
        points.push({ urlkey: d.urlkey, name: d.name, status: d.status, scored, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, scores });
    }
    // Graded dots draw last so an ungraded neighbor never covers them.
    points.sort((a, b) => Number(a.scored) - Number(b.scored));
    return { viewBox: countyGeo.usStates.viewBox, outlines: countyGeo.usStates.outlines, points, missingCount: missing };
}
