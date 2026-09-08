import crypto from 'crypto';
import * as fs from 'fs';
import { stateDomainList } from '../_data/variables.js';

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
const REQUIRED_TOPICS = ['botability', 'accessibility', 'security', 'usability'];
const OUTPUT_FILE = './public/data/myscangov_homepage_audits.json';
const MIN_RECORD_COUNT = 900;
const MAX_DROP_PERCENT = 10;

function generateAuthParams() {
    const time = Date.now();
    const hash = crypto.createHash('md5').update(HASH_SECRET + time).digest('hex');
    return { time, hash };
}

function isCompleteRecord(record) {
    if (!record.scores) return { complete: false, reason: 'no scores object' };
    if (isNaN(record.overallScore)) return { complete: false, reason: 'overallScore is NaN' };

    for (const topic of REQUIRED_TOPICS) {
        if (!record.scores[topic]) {
            return { complete: false, reason: `missing topic: ${topic}` };
        }
        if (isNaN(record.scores[topic].score)) {
            return { complete: false, reason: `${topic} score is NaN` };
        }
        if (record.scores[topic].all === 0) {
            return { complete: false, reason: `${topic} has 0 attributes` };
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

function validateData(complete) {
    const errors = [];

    // Check minimum record count
    if (complete.length < MIN_RECORD_COUNT) {
        errors.push(`Only ${complete.length} records (minimum: ${MIN_RECORD_COUNT})`);
    }

    // Check all 50 states + DC are present
    const domainKeys = new Set(complete.map(d => d.urlkey));
    const missingStates = stateDomainList.filter(s => !domainKeys.has(s));
    if (missingStates.length > 0) {
        errors.push(`Missing ${missingStates.length} state(s): ${missingStates.join(', ')}`);
    }

    // Check domain coverage vs previous data
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            const existingDomains = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
            if (existingDomains.length > 0) {
                const { missing, added } = compareDomainCoverage(complete, existingDomains);

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

                const dropPercent = (missing.length / existingDomains.length) * 100;
                if (dropPercent > MAX_DROP_PERCENT) {
                    errors.push(
                        `Domain count dropped ${dropPercent.toFixed(1)}% (${missing.length} of ${existingDomains.length} missing, max ${MAX_DROP_PERCENT}%)`
                    );
                }
            }
        } catch {
            console.log('Could not read existing data file for comparison');
        }
    }

    return errors;
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

    console.log(`\nSummary: Fetched ${records.length} domains, filtered ${filtered.length} incomplete, ${complete.length} valid records`);

    // Validate before returning
    const errors = validateData(complete);
    if (errors.length > 0) {
        console.error('\n*** DATA VALIDATION FAILED ***');
        for (const err of errors) {
            console.error(`  - ${err}`);
        }
        if (!force) {
            console.error('\nData file was NOT updated. Previous data remains intact.');
            return null;
        }
        console.error('\n--force given: writing the data anyway.');
    }

    return complete;
}

// Run standalone
const isMainModule = process.argv[1] && process.argv[1].includes('fetch-auditor-data');
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
