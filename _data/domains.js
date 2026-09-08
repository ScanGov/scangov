import { readFileSync } from 'fs';

export default function() {

    let scanData = JSON.parse(readFileSync('./public/data/myscangov_homepage_audits.json', 'utf8'));
    // Local builds on small machines: DOMAIN_LIMIT=1000 builds the first N domains only.
    // Eleventy keeps every rendered page in memory (~2.7GB of heap per 1,000 domains),
    // so a full build needs ~12GB; CI sets NODE_OPTIONS for that.
    if (process.env.DOMAIN_LIMIT) scanData = scanData.slice(0, parseInt(process.env.DOMAIN_LIMIT, 10));
    if (process.env.ELEVENTY_RUN_MODE === 'serve') {
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
        scanData = cutScanData;
    }

    return scanData;
}
