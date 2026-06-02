import { domainHistories as domains, dateNumberToString } from './history.js';
import { default as domainJS } from './domains.js';

const domainList = domainJS();

export default function () {
    // Build redirect/name lookup from main domain data
    const domainInfo = new Map();
    domainList.forEach(d => {
        domainInfo.set(d.urlkey, { redirect: d.redirect, name: d.name });
    });

    const remainingDomains = [...domainList];

    // History is a list of every domain and its changes
    const history = [];
    for (const domain of domains) {
        // Skip domains without a page if on local
        if (process.env.ELEVENTY_RUN_MODE === 'serve') {
            let found = false;
            for (let i = 0; i < remainingDomains.length; i++) {
                const d = remainingDomains[i];

                if (d.urlkey === domain.url) {
                    found = true;
                    remainingDomains.splice(i, 1);
                    break;
                }
            }

            if (!found)
                continue;
        }

        const obj = { url: domain.url };

        // Get domain data
        const info = domainInfo.get(domain.url);
        if (info) {
            obj.redirect = info.redirect;
            obj.name = info.name;
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
