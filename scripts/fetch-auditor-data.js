import { pathToFileURL } from 'node:url';
import crypto from 'crypto';
import * as fs from 'fs';
import { stateDomainList } from '../_data/variables.js';
import { categoryOf } from './categories.js';
import { ciAnnotate } from './ci-annotate.js';

// The auditor's buildhomepages event writes the homepage payload to S3
// (bucket audits.scangov.org, key homepages/latest.json). The bucket is public;
// the audits.scangov.org hostname has no DNS record and the virtual-hosted S3
// form fails TLS (dotted bucket name), so use the path-style URL.
const HOMEPAGES_JSON_URL = process.env.SCANGOV_HOMEPAGES_URL
    || 'https://s3.us-east-1.amazonaws.com/audits.scangov.org/homepages/latest.json';
// GET /all?homepages=true only *triggers* a rebuild of that payload (hash-authed).
const AUDITOR_URL = 'https://audits.my.scangov.com/all';
const HASH_SECRET = process.env.SCANGOV_HASH_SECRET;
const REBUILD_WAIT_MS = 10 * 60 * 1000;
const REBUILD_POLL_MS = 15 * 1000;
// Topics every graded record must carry. Deliberately not derived from
// audits.json: a topic that exists in the standards before the auditor has
// rebuilt the homepages payload with it would drop every record from the
// build. Add a new topic here only after the auditor emits it in
// homepages/latest.json (readability added 2026-10-12, after the first
// five-topic payload; see the auditor's docs/readability-topic-plan.md).
const REQUIRED_TOPICS = ['botability', 'accessibility', 'security', 'usability', 'readability'];
// Topics that may legitimately carry no scored attribute. Readability is derived
// from the text a page serves without JavaScript: a client-side rendered homepage
// (alabama.gov, sd.gov), a non-English page or a skipped extraction has nothing to
// grade, and the auditor leaves the topic at 0 attributes with a null score. The
// site renders those without a readability grade. Requiring attributes here
// dropped 352 of 4,841 scored records, six states among them (2026-10-25).
const UNSCORED_OK_TOPICS = new Set(['readability']);
const OUTPUT_FILE = './public/data/myscangov_homepage_audits.json';
// Validation thresholds (validateData). The relative checks against the
// previous data file are the real protection; the absolute floor only guards
// against a tiny committed file. 7,049 records on 2026-11-08.
const MIN_RECORD_COUNT = 5000;
const MAX_DROP_PERCENT = 10;
// Share of complete records the auditor actually graded (status 200): 86.5% on
// 2026-11-08. A payload where the scanner was blocked en masse keeps every
// domain, so the drop check alone would wave it through.
const MIN_GRADED_PERCENT = 75;
// Categories (scripts/categories.js) smaller than this are too noisy for a
// percentage drop check.
const MIN_CATEGORY_SIZE = 20;
// A newest record time older than this is a warning, not an error: the payload
// was probably not rebuilt (SCANGOV_HASH_SECRET unset, or the trigger failed).
const MAX_AGE_DAYS = 14;

function generateAuthParams() {
    const time = Date.now();
    const hash = crypto.createHash('md5').update(HASH_SECRET + time).digest('hex');
    return { time, hash };
}

export function isCompleteRecord(record) {
    // Blocked or unreachable homepages arrive with the HTTP status the site gave
    // the auditor and no scores; the site renders them as "unknown grade" and lists
    // them on /status/<code>/, so they are complete as long as they carry a status.
    if (record.status && record.status !== 200) {
        return record.urlkey ? { complete: true } : { complete: false, reason: 'blocked record without urlkey' };
    }
    if (!record.scores) return { complete: false, reason: 'no scores object' };
    if (isNaN(record.overallScore)) return { complete: false, reason: 'overallScore is NaN' };

    for (const topic of REQUIRED_TOPICS) {
        if (!record.scores[topic]) {
            return { complete: false, reason: `missing topic: ${topic}` };
        }
        if (record.scores[topic].all === 0) {
            if (UNSCORED_OK_TOPICS.has(topic)) continue;
            return { complete: false, reason: `${topic} has 0 attributes` };
        }
        if (isNaN(record.scores[topic].score)) {
            return { complete: false, reason: `${topic} score is NaN` };
        }
    }

    return { complete: true };
}

function compareDomainCoverage(newDomains, existingDomains) {
    const newKeys = new Set(newDomains.map(d => d.urlkey));
    const existingKeys = new Set(existingDomains.map(d => d.urlkey));

    const missing = [...existingKeys].filter(k => !newKeys.has(k));
    const added = [...newKeys].filter(k => !existingKeys.has(k));

    return { missing, added };
}

// Is this payload good enough to replace the committed data file? Errors block
// the write (prepare-data.js then builds with the previous file); warnings are
// only surfaced. `existing` is the previous data file's records, if any.
export function validateData(complete, existing = [], { now = Date.now() } = {}) {
    const errors = [];
    const warnings = [];

    if (complete.length < MIN_RECORD_COUNT) {
        errors.push(`Only ${complete.length} records (minimum: ${MIN_RECORD_COUNT})`);
    }

    // All 50 states + DC are present
    const domainKeys = new Set(complete.map(d => d.urlkey));
    const missingStates = stateDomainList.filter(s => !domainKeys.has(s));
    if (missingStates.length > 0) {
        errors.push(`Missing ${missingStates.length} state(s): ${missingStates.join(', ')}`);
    }

    // Most sites were actually graded
    const graded = complete.filter(d => d.status === 200).length;
    const gradedPercent = complete.length ? (graded / complete.length) * 100 : 0;
    if (gradedPercent < MIN_GRADED_PERCENT) {
        errors.push(`Only ${gradedPercent.toFixed(1)}% of records are graded (${graded} of ${complete.length} at status 200, minimum ${MIN_GRADED_PERCENT}%)`);
    }

    // The payload is a recent scan
    const newest = complete.reduce((max, d) => (Number.isFinite(d.time) && d.time > max ? d.time : max), 0);
    if (newest > 0) {
        const ageDays = (now - newest) / 86400000;
        if (ageDays > MAX_AGE_DAYS) {
            warnings.push(`Newest scan is ${Math.round(ageDays)} days old (${new Date(newest).toISOString().slice(0, 10)}); the homepages payload may not have been rebuilt`);
        }
    }

    // Domain coverage vs previous data, overall and per category
    if (existing.length > 0) {
        const { missing, added } = compareDomainCoverage(complete, existing);

        if (missing.length > 0) {
            console.log(`\n${missing.length} domains in existing data but missing from new data:`);
            for (const m of missing) {
                console.log(`  - ${m}`);
            }
        }

        if (added.length > 0) {
            console.log(`\n${added.length} new domains not in existing data:`);
            for (const a of added) {
                console.log(`  + ${a}`);
            }
        }

        const dropPercent = (missing.length / existing.length) * 100;
        if (dropPercent > MAX_DROP_PERCENT) {
            errors.push(
                `Domain count dropped ${dropPercent.toFixed(1)}% (${missing.length} of ${existing.length} missing, max ${MAX_DROP_PERCENT}%)`
            );
        }

        // The overall check hides a lost category inside a large one (edu is
        // 3,000+ sites; losing every county would be well under 10%).
        const byCategory = (list) => {
            const out = {};
            for (const d of list) (out[categoryOf(d.urlkey)] ||= new Set()).add(d.urlkey);
            return out;
        };
        const newCats = byCategory(complete);
        for (const [category, oldKeys] of Object.entries(byCategory(existing))) {
            if (oldKeys.size < MIN_CATEGORY_SIZE) continue;
            const newKeys = newCats[category] || new Set();
            const lost = [...oldKeys].filter(k => !newKeys.has(k)).length;
            const pct = (lost / oldKeys.size) * 100;
            if (pct > MAX_DROP_PERCENT) {
                errors.push(`${category}: ${pct.toFixed(1)}% of domains missing (${lost} of ${oldKeys.size}, max ${MAX_DROP_PERCENT}%)`);
            }
        }
    }

    return { errors, warnings };
}

async function payloadLastModified() {
    try {
        const r = await fetch(HOMEPAGES_JSON_URL, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
        return r.ok ? r.headers.get('last-modified') : null;
    } catch {
        return null;
    }
}

// Ask the auditor to rebuild the payload, then wait for S3 to change. Best effort:
// any failure here just means we read whatever is already in S3.
async function triggerRebuild() {
    const before = await payloadLastModified();
    const { time, hash } = generateAuthParams();
    console.log(`Triggering homepages rebuild (current payload Last-Modified: ${before || 'unknown'})...`);
    try {
        const response = await fetch(`${AUDITOR_URL}?homepages=true&time=${time}&hash=${hash}`, { signal: AbortSignal.timeout(60000) });
        const body = await response.text();
        if (!response.ok || !/build triggered/i.test(body)) {
            console.warn(`Rebuild trigger returned ${response.status}: ${body.substring(0, 200)}. Using existing payload.`);
            return;
        }
    } catch (e) {
        console.warn(`Rebuild trigger failed: ${e.message}. Using existing payload.`);
        return;
    }
    const deadline = Date.now() + REBUILD_WAIT_MS;
    while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, REBUILD_POLL_MS));
        const after = await payloadLastModified();
        if (after && after !== before) {
            console.log(`Payload rebuilt at ${after}`);
            return;
        }
    }
    console.warn('Payload did not change within the wait window. Using existing payload.');
}

// force: write the data even when validation fails (standalone --force only; the
// Eleventy build never forces). Validation errors are still printed.
export async function fetchAuditorData({ force = false } = {}) {
    if (HASH_SECRET) {
        await triggerRebuild();
    } else {
        console.log('SCANGOV_HASH_SECRET not set, skipping rebuild trigger (reading existing S3 payload)');
    }

    console.log(`Fetching homepage audit data from ${HOMEPAGES_JSON_URL} ...`);
    let data;
    try {
        const response = await fetch(HOMEPAGES_JSON_URL, { signal: AbortSignal.timeout(120000) });
        console.log(`[DEBUG] Response status: ${response.status}, last-modified=${response.headers.get('last-modified')}, content-length=${response.headers.get('content-length')}`);
        if (!response.ok) {
            throw new Error(`S3 returned status ${response.status}`);
        }
        data = await response.json();
    } catch (e) {
        // Network or parse failure: fall back to the committed data file rather than failing the build.
        console.error(`Could not fetch homepage audit data: ${e.message}`);
        return null;
    }

    const records = data.records || data;
    if (!Array.isArray(records)) {
        console.error(`Payload did not contain an array of records (top-level keys: ${Object.keys(data || {}).join(', ')})`);
        return null;
    }

    console.log(`Received ${records.length} records from auditor API`);

    // Log metadata if provided by the auditor API
    if (data.meta) {
        const m = data.meta;
        console.log(`\nAuditor coverage:`);
        console.log(`  Total homepages:     ${m.totalHomepages}`);
        console.log(`  Recently audited:    ${m.recentlyAudited} (since ${new Date(m.cutoffDate).toLocaleDateString()})`);
        console.log(`  Complete records:    ${m.completeRecords}`);
        console.log(`  Filtered out:        ${m.filteredOut}`);
    }

    // Filter incomplete records
    const complete = [];
    const filtered = [];
    for (const record of records) {
        const check = isCompleteRecord(record);
        if (check.complete) {
            complete.push(record);
        } else {
            filtered.push({ urlkey: record.urlkey, reason: check.reason });
        }
    }

    if (filtered.length > 0) {
        console.log(`\nFiltered ${filtered.length} incomplete records:`);
        for (const f of filtered) {
            console.log(`  - ${f.urlkey}: ${f.reason}`);
        }
    }

    const blocked = complete.filter((r) => r.status !== 200).length;
    console.log(`\nSummary: Fetched ${records.length} domains, filtered ${filtered.length} incomplete, ${complete.length} valid records (${blocked} blocked/unreachable, shown as unknown grade)`);

    // Validate before returning
    let existing = [];
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
        } catch {
            console.log('Could not read existing data file for comparison');
        }
    }
    const { errors, warnings } = validateData(complete, existing);
    if (warnings.length > 0) {
        ciAnnotate('warning', 'Audit data warnings', warnings);
    }
    if (errors.length > 0) {
        ciAnnotate('error', 'Audit data validation failed', errors);
        if (!force) {
            console.error('\nData file was NOT updated. Previous data remains intact.');
            return null;
        }
        console.error('\n--force given: writing the data anyway.');
    }

    return complete;
}

// Run standalone
const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) {
    const force = process.argv.includes('--force');
    try {
        const data = await fetchAuditorData({ force });
        if (data === null) {
            process.exit(1);
        }
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data), 'utf8');
        console.log(`Wrote ${data.length} records to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}
