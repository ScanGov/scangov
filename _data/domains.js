import { readFileSync } from 'fs';
import { isCounty, stateCodeOf } from '../scripts/counties.js';

export default function() {

    let scanData = JSON.parse(readFileSync('./public/data/myscangov_homepage_audits.json', 'utf8'));
    // Local builds on small machines: DOMAIN_LIMIT=1000 builds the first N domains only.
    // Eleventy keeps every rendered page in memory (~2.7GB of heap per 1,000 domains),
    // so a full build needs ~12GB; CI sets NODE_OPTIONS for that.
    if (process.env.DOMAIN_LIMIT) scanData = scanData.slice(0, parseInt(process.env.DOMAIN_LIMIT, 10));
    // SAMPLE_BUILD=1 applies the dev-server truncation to a one-shot build too
    // (npm run build:counties), for inspecting output files on a laptop.
    if (process.env.ELEVENTY_RUN_MODE === 'serve' || process.env.SAMPLE_BUILD) {
        let cutScanData = scanData.slice(0, 50);
        // Put a domain of each type in
        let stateDomain = scanData.find(d => d.urlkey === 'ca.gov');
        if (stateDomain && !cutScanData.find(d => d.urlkey === 'ca.gov'))
            cutScanData.push(stateDomain);
        let cityDomain = scanData.find(d => d.urlkey === 'cityofsacramento.gov');
        if (cityDomain && !cutScanData.find(d => d.urlkey === 'cityofsacramento.gov'))
            cutScanData.push(cityDomain);
        let countyDomain = scanData.find(d => d.urlkey === 'lacounty.gov');
        if (countyDomain && !cutScanData.find(d => d.urlkey === 'lacounty.gov'))
            cutScanData.push(countyDomain);
        let eduDomain = scanData.find(d => d.urlkey === 'sanjac.edu');
        if (eduDomain && !cutScanData.find(d => d.urlkey === 'sanjac.edu'))
            cutScanData.push(eduDomain);
        // SERVE_STATES=TX,VT,AK keeps every county in those states so the
        // per-state county pages render with real data on the dev server.
        // Pair with BUILD_ROLE=core (npm run start:counties) to skip the
        // per-domain profile pages those counties would otherwise add.
        const serveStates = (process.env.SERVE_STATES || '')
            .split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        if (serveStates.length) {
            for (const d of scanData) {
                if (isCounty(d) && serveStates.includes(stateCodeOf(d)) && !cutScanData.includes(d))
                    cutScanData.push(d);
            }
        }
        scanData = cutScanData;
    }

    return scanData;
}
