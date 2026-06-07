import crypto from 'crypto';
import * as fs from 'fs';
import { stateDomainList } from '../_data/variables.js';

const AUDITOR_URL = 'https://audits.my.scangov.com/all';
const HASH_SECRET = process.env.SCANGOV_HASH_SECRET;
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

export async function fetchAuditorData() {
    if (!HASH_SECRET) {
        console.log('SCANGOV_HASH_SECRET not set, skipping data fetch');
        return null;
    }
    const { time, hash } = generateAuthParams();
    const url = `${AUDITOR_URL}?homepages=true&time=${time}&hash=${hash}`;

    console.log('Fetching data from auditor API...');
    console.log(`[DEBUG] Request URL: ${AUDITOR_URL}?homepages=true&time=${time}&hash=<redacted>`);
    const response = await fetch(url);
    console.log(`[DEBUG] Response status: ${response.status} ${response.statusText}`);
    console.log(`[DEBUG] Response headers: content-type=${response.headers.get('content-type')}, content-length=${response.headers.get('content-length')}`);
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[DEBUG] Error response body: ${errorBody.substring(0, 500)}`);
        throw new Error(`Auditor API returned status ${response.status}`);
    }

    const rawText = await response.text();
    console.log(`[DEBUG] Response body length: ${rawText.length} characters`);
    console.log(`[DEBUG] Response body preview (first 300 chars): ${rawText.substring(0, 300)}`);

    let data;
    try {
        data = JSON.parse(rawText);
    } catch (e) {
        console.error(`[DEBUG] JSON parse failed: ${e.message}`);
        console.error(`[DEBUG] Full response body: ${rawText.substring(0, 1000)}`);
        throw new Error(`Failed to parse auditor API response as JSON: ${e.message}`);
    }

    console.log(`[DEBUG] Parsed data type: ${typeof data}, isArray: ${Array.isArray(data)}`);
    console.log(`[DEBUG] Top-level keys: ${typeof data === 'object' && data !== null ? Object.keys(data).join(', ') : 'N/A'}`);
    if (data.meta) {
        console.log(`[DEBUG] data.meta: ${JSON.stringify(data.meta)}`);
    }

    const records = data.records || data;
    console.log(`[DEBUG] Records isArray: ${Array.isArray(records)}, length: ${Array.isArray(records) ? records.length : 'N/A'}`);
    if (Array.isArray(records) && records.length > 0) {
        console.log(`[DEBUG] First record sample: ${JSON.stringify(records[0]).substring(0, 500)}`);
    }

    if (!Array.isArray(records)) {
        throw new Error('Auditor API did not return an array of records');
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
        console.error('\nData file was NOT updated. Previous data remains intact.');
        return null;
    }

    return complete;
}

// Run standalone
const isMainModule = process.argv[1] && process.argv[1].includes('fetch-auditor-data');
if (isMainModule) {
    if (!HASH_SECRET) {
        console.error('Error: SCANGOV_HASH_SECRET environment variable is not set');
        process.exit(1);
    }
    try {
        const data = await fetchAuditorData();
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
