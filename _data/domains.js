import { readFileSync } from 'fs';

export default function () {

    let scanData = JSON.parse(readFileSync('./public/data/myscangov_homepage_audits.json', 'utf8'));
    if (process.env.ELEVENTY_RUN_MODE === 'serve') {
        let cutScanData = scanData.slice(0, 50);
        // Put a state and city domain in
        if (!cutScanData.find(d => d.urlkey === 'ca.gov'))
            cutScanData.push(scanData.find(d => d.urlkey === 'ca.gov'));
        if (!cutScanData.find(d => d.urlkey === 'cityofsacramento.gov'))
            cutScanData.push(scanData.find(d => d.urlkey === 'cityofsacramento.gov'));
        scanData = cutScanData;
    }

    return scanData;
}
