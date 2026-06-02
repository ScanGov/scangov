import { readFileSync } from 'fs';
import { default as domainJS } from './domains.js';

export const dateNumberToString = num => {
    let date = num;
    const day = date % 100;
    date = Math.floor(date / 100);
    const month = date % 100;
    date = Math.floor(date / 100);
    return month + '/' + day + '/' + date;
}

// Map old topic display names to new ones for historical changelog entries
const topicNameMap = {
    'Content': 'Usability',
    'SEO': 'Botability',
    'Domain': 'Security',
    'Performance': 'Usability',
    'Social': 'Usability',
    'AI-friendly': 'Botability',
};

function normalizeTopicName(topic) {
    return topicNameMap[topic] || topic;
}

export const domainHistories = (() => {
    const changesFromMyScanGov = JSON.parse(readFileSync('./scripts/data/myscangov_changes.json'));
    const domainList = domainJS();

    const history = [];
    const processedDomains = new Set();

    for (const domain in changesFromMyScanGov) {
        processedDomains.add(domain);
        const domainChanges = new Map();

        for (const dateStr in changesFromMyScanGov[domain]) {
            const dateNum = parseInt(dateStr);
            const changes = changesFromMyScanGov[domain][dateStr].map(change => ({
                ...change,
                topic: normalizeTopicName(change.topic)
            }));
            domainChanges.set(dateNum, changes);
        }

        history.push({ url: domain, changes: domainChanges });
    }

    // Add domains that have no changelog history yet
    domainList.forEach(domainItem => {
        if (!processedDomains.has(domainItem.urlkey)) {
            history.push({ url: domainItem.urlkey, changes: new Map() });
        }
    });

    return history;
})();
