// The rankings as downloadable files: one list per rankings group plus all sites.
// Same ranked lists as the rankings pages (rankingPosition is already set). Each
// row is one site: its rank, organization, whether it was fully scanned, the
// overall score and grade, and the score and grade for each indicator. A site that
// was not fully scanned keeps its row with empty scores, so the file lists every
// site the page does. Feeds content/data/rankings-csv.njk and rankings-json.njk.
// Default export only.

import { default as sorts } from './sorts.js';
import { default as stateData } from './states.js';
import { default as countyData } from './counties.js';
import { default as cityData } from './cities.js';
import { default as federalData } from './federal.js';
import { default as eduData } from './edu.js';
import { default as topicsData } from './topics.js';
import { isScored } from '../scripts/group-summary.js';
import { gradeOf, scoreOf } from '../scripts/counties.js';

const SOURCES = [
    { key: 'all', label: 'All sites', data: () => sorts().overall },
    { key: 'states', label: 'States', data: stateData },
    { key: 'counties', label: 'Counties', data: countyData },
    { key: 'cities', label: 'Cities', data: cityData },
    { key: 'federal', label: 'Federal', data: federalData },
    { key: 'edu', label: 'Education', data: eduData },
];

const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default async function () {
    const topics = (await topicsData()).keys;
    return SOURCES.map(source => {
        const rows = source.data().map(d => {
            const scored = isScored(d);
            const row = {
                rank: d.rankingPosition ?? null,
                site: d.urlkey,
                organization: d.name || '',
                fully_scanned: scored,
                overall_score: scored ? scoreOf(d, 'overall') : null,
                overall_grade: scored && scoreOf(d, 'overall') !== null ? gradeOf(scoreOf(d, 'overall')) : null,
            };
            for (const t of topics) {
                const s = scored ? scoreOf(d, t) : null;
                row[`${t}_score`] = s;
                row[`${t}_grade`] = s === null ? null : gradeOf(s);
            }
            row.report = `https://scangov.org/profile/${slug(d.urlkey)}/overall/`;
            return row;
        });
        return { key: source.key, label: source.label, columns: Object.keys(rows[0] || {}), rows };
    });
}
