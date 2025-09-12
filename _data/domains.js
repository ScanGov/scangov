import { readFileSync } from 'fs';

export default function () {

    let scanData = JSON.parse(readFileSync('./public/data/myscangov_homepage_audits.json', 'utf8'));
    if (process.env.ELEVENTY_RUN_MODE === 'serve') {
        scanData = scanData.slice(0, 50)
            .concat(
                // Put a state and city domain in
                scanData.find(d => d.urlkey === 'ca.gov'),
                scanData.find(d => d.urlkey === 'cityofsacramento.gov')
            );
    }

    return scanData;
}
