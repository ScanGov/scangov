import { domainHistories as domains, dateNumberToString } from './history.js';
import { default as domainJS } from './domains.js';
import { readFileSync } from 'fs';

const domainList = domainJS();

export default function () {
    // Used for the visit page link in the profile links
    const redirects = JSON.parse(readFileSync('public/data/url.json'));

    // History is a list of every domain and its changes
    const history = [];
    for (const domain of domains) {
        // Skip domains without a page if on local
        if (process.env.ELEVENTY_RUN_MODE === 'serve') {
            let found = false;
            for (let i = 0; i < domainList.length; i++) {
                const d = domainList[i];

                if (d.url === domain.url) {
                    found = true;
                    domainList.splice(i, 1);
                    break;
                }
            }

            if (!found)
                continue;
        }

        const obj = { url: domain.url };

        // Get domain data
        for (let i = 0; i < redirects.length; i++) {
            const r = redirects[i];

            if (r.url === domain.url) {
                obj.redirect = r.redirect;
                obj.name = r.name;
                redirects.splice(i, 1);
                break;
            }

        }
        obj.log = [...domain.changes]
            .sort((a, b) => b[0] - a[0])
            .map(c => {
                return {
                    url: domain.url,
                    date: dateNumberToString(c[0]),
                    changes: c[1]
                };
            });

        history.push(obj);
    }
    return history;
}
