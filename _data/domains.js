import { readFileSync } from 'fs';

export default function () {

    let scanData = JSON.parse(readFileSync('./public/data/myscangov_homepage_audits.json', 'utf8'));
    // TODO: Re-enable serve mode truncation once domain count is back to ~1000+
    // if (process.env.ELEVENTY_RUN_MODE === 'serve') {
    //     let cutScanData = scanData.slice(0, 50);
    //     // Put a state and city domain in
    //     let stateDomain = scanData.find(d => d.urlkey === 'ca.gov');
    //     if (stateDomain && !cutScanData.find(d => d.urlkey === 'ca.gov'))
    //         cutScanData.push(stateDomain);
    //     let cityDomain = scanData.find(d => d.urlkey === 'cityofsacramento.gov');
    //     if (cityDomain && !cutScanData.find(d => d.urlkey === 'cityofsacramento.gov'))
    //         cutScanData.push(cityDomain);
    //     scanData = cutScanData;
    // }

    return scanData;
}
