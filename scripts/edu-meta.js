// IPEDS metadata for the education cohort, keyed by domain, from
// _data/edu_institutions.csv: a copy of the auditor's
// scripts/data/edu_institutions.csv (built there by
// scripts/build-edu-institutions.mjs from the load list, the original 816
// .edu sites, IPEDS, Census metro names and the NCAA directory). One row per
// institution domain: state, control, type, Carnegie class, system, metro,
// lists, conference.
//
// A scanned urlkey that is a subdomain of a listed domain (home.dartmouth.edu)
// resolves to the listed row; a row's canonical_domain also indexes it.
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

export const INSTITUTIONS_FILE = new URL('../_data/edu_institutions.csv', import.meta.url);

const normalize = (domain) => String(domain || '').toLowerCase().replace(/^www\./, '');

let rows = null;
let index = null;
export function eduInstitutions() {
    if (rows) return rows;
    rows = parse(readFileSync(INSTITUTIONS_FILE, 'utf8'), { columns: true, skip_empty_lines: true, trim: true, bom: true });
    index = new Map();
    for (const row of rows) {
        const key = normalize(row.domain);
        if (key && !index.has(key)) index.set(key, row);
        const canonical = normalize(row.canonical_domain);
        if (canonical && !index.has(canonical)) index.set(canonical, row);
    }
    return rows;
}

export function eduMetaOf(d) {
    eduInstitutions();
    let key = normalize(typeof d === 'string' ? d : (d.urlkey || d.url));
    while (key) {
        const row = index.get(key);
        if (row) return row;
        const dot = key.indexOf('.');
        // Strip one subdomain label at a time; stop at the registrable domain.
        if (dot < 0 || key.split('.').length <= 2) return null;
        key = key.slice(dot + 1);
    }
    return null;
}

// Two-letter state or territory code, or null when the record has no row or
// the row has no state.
export function eduStateOf(d) {
    const row = eduMetaOf(d);
    return row && row.state ? row.state.toUpperCase() : null;
}
