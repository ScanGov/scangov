/**
 * One-time migration script: extracts changelog diffs from the old
 * public/data/*.json history files and merges them into
 * scripts/data/myscangov_changes.json.
 *
 * Usage: node --input-type=module scripts/migrate-history.js
 *        (or run via: node scripts/migrate-history.js  if package.json has "type":"module")
 */

import { readFileSync, writeFileSync } from 'fs';

const SITEMAP_COMPLETION_THRESHOLD = 1.0;

// Old variable-to-topic mappings (from old variables.js)
const variablesMap = new Map([
    ['title', 'content'], ['description', 'content'], ['viewport', 'content'],
    ['canonical', 'seo'],
    ['ogSiteName', 'social'], ['ogType', 'social'], ['ogTitle', 'social'],
    ['ogDescription', 'social'], ['ogUrl', 'social'], ['ogImage', 'social'], ['ogImageAlt', 'social'],
    ['valid', 'seo'], ['allowed', 'seo'], ['sitemap', 'seo'],
    ['status', 'seo'], ['xml', 'seo'], ['completion', 'seo'],
    ['a11y-best-practices', 'accessibility'], ['a11y-color-contrast', 'accessibility'],
    ['a11y-names-labels', 'accessibility'], ['a11y-navigation', 'accessibility'],
    ['a11y-aria', 'accessibility'], ['a11y-language', 'accessibility'],
    ['a11y-audio-video', 'accessibility'], ['a11y-tables-lists', 'accessibility'],
    ['hidden', 'accessibility'],
    ['hsts', 'security'], ['csp', 'security'], ['xContentTypeOptions', 'security'], ['securityTxt', 'security'],
    ['https', 'domain'], ['www', 'domain'], ['dotgov', 'domain'],
    ['ttfb', 'performance'], ['fcp', 'performance'], ['lcp', 'performance'],
    ['cls', 'performance'], ['inp', 'performance'],
]);

const variableTopics = new Map([
    ['content', ['title', 'description', 'viewport']],
    ['performance', ['ttfb', 'fcp', 'lcp', 'cls', 'inp']],
    ['accessibility', ['a11y-best-practices', 'a11y-color-contrast', 'a11y-names-labels', 'a11y-navigation', 'a11y-aria', 'a11y-language', 'a11y-audio-video', 'a11y-tables-lists', 'hidden']],
    ['security', ['hsts', 'csp', 'xContentTypeOptions', 'securityTxt']],
    ['domain', ['https', 'www', 'dotgov']],
    ['social', ['ogSiteName', 'ogType', 'ogTitle', 'ogDescription', 'ogUrl', 'ogImage', 'ogImageAlt']],
    ['seo', ['valid', 'allowed', 'sitemap', 'status', 'xml', 'completion', 'canonical']],
]);

const dataFiles = new Map([
    ['metadata', ['title', 'description', 'viewport', 'canonical', 'ogSiteName', 'ogType', 'ogTitle', 'ogDescription', 'ogUrl', 'ogImage', 'ogImageAlt']],
    ['robots', ['valid', 'allowed', 'sitemap']],
    ['security', ['hsts', 'csp', 'xContentTypeOptions', 'securityTxt']],
    ['sitemap', ['status', 'xml', 'completion']],
    ['url', ['https', 'www', 'dotgov']],
    ['performance', ['ttfb', 'fcp', 'lcp', 'cls', 'inp']],
    ['accessibility', ['a11y-best-practices', 'a11y-color-contrast', 'a11y-names-labels', 'a11y-navigation', 'a11y-aria', 'a11y-language', 'a11y-audio-video', 'a11y-tables-lists', 'hidden']],
]);

const elementToDataFile = new Map();
for (const [file, elements] of dataFiles) {
    for (const element of elements) {
        elementToDataFile.set(element, file);
    }
}

const upperCaseTopic = topic => {
    const map = {
        'accessibility': 'Accessibility', 'content': 'Content', 'domain': 'Domain',
        'performance': 'Performance', 'seo': 'SEO', 'security': 'Security', 'social': 'Social',
    };
    return map[topic] || topic;
};

const createDateNumber = time => {
    const date = new Date(time);
    return (date.getFullYear() * 100 + (date.getMonth() + 1)) * 100 + date.getDate();
};

function createChangeItem(topic, date, newItem, oldItem) {
    if (topic === 'seo') {
        newItem = { ...newItem };
        oldItem = { ...oldItem };
        newItem.sitemap = !!newItem.sitemap;
        oldItem.sitemap = !!oldItem.sitemap;
        newItem.status = newItem.status < 300;
        oldItem.status = oldItem.status < 300;
        if (newItem.completion != undefined)
            newItem.completion = newItem.completion >= SITEMAP_COMPLETION_THRESHOLD;
        if (oldItem.completion != undefined)
            oldItem.completion = oldItem.completion >= SITEMAP_COMPLETION_THRESHOLD;
    }

    const elements = variableTopics.get(topic);
    let oldTotal = 0, newTotal = 0;
    let oldScore = 0, newScore = 0;
    for (const element of elements) {
        if (oldItem[element] != undefined) {
            oldScore += oldItem[element];
            oldTotal++;
        }
        if (newItem[element] != undefined) {
            newScore += newItem[element];
            newTotal++;
        }
    }

    return {
        statusCode: newItem.statusCode,
        topic: upperCaseTopic(topic),
        date: String(date),
        oldScore, newScore,
        oldPercent: oldTotal > 0 ? Math.round(100 * oldScore / oldTotal) : 0,
        newPercent: newTotal > 0 ? Math.round(100 * newScore / newTotal) : 0,
        oldTotal, newTotal,
    };
}

// Read updated_time for the "current" snapshot timestamp
let updateTime;
try {
    updateTime = parseInt(readFileSync('public/data/updated_time', 'utf8'));
} catch {
    // Fall back to the latest file modification time of url.json
    updateTime = Date.now();
    console.log('Warning: public/data/updated_time not found, using current time');
}

// Load old data files
const histories = [
    ['metadata', JSON.parse(readFileSync('./public/data/metadata.json'))],
    ['robots', JSON.parse(readFileSync('./public/data/robots.json'))],
    ['security', JSON.parse(readFileSync('./public/data/security.json'))],
    ['sitemap', JSON.parse(readFileSync('./public/data/sitemap.json'))],
    ['url', JSON.parse(readFileSync('./public/data/url.json'))],
    ['performance', JSON.parse(readFileSync('./public/data/performance.json'))],
    ['accessibility', JSON.parse(readFileSync('./public/data/accessibility.json'))],
];

console.log('Loaded old data files:');
for (const [name, data] of histories) {
    console.log(`  ${name}.json: ${data.length} domains`);
}

// Build per-domain history maps (same logic as old history.js)
const domains = new Map();
for (const history of histories) {
    for (const domain of history[1]) {
        let obj = domains.get(domain.url);
        if (!obj) obj = new Map();

        domain.time = updateTime;
        const domainHistory = domain.history || [];
        delete domain.history;
        obj.set(history[0], domainHistory.concat(domain));
        domains.set(domain.url, obj);
    }
}

console.log(`\nProcessing ${domains.size} domains from old data files...`);

// Compute change diffs (same logic as old history.js)
const migrated = {};
let totalEntries = 0;

for (const [domainUrl, domainHistories] of domains) {
    const statusHistory = domainHistories.get('url');
    if (!statusHistory) continue;

    const newHistories = new Map();
    for (const [topic] of variableTopics) {
        newHistories.set(topic, new Map());
    }

    for (const [fileName, fileHistory] of domainHistories) {
        const items = dataFiles.get(fileName);
        if (!items) continue;

        for (const date of fileHistory) {
            const dateNumber = createDateNumber(date.time);

            for (const item of items) {
                const itemTopic = variablesMap.get(item);
                if (!itemTopic) continue;
                const topicHistory = newHistories.get(itemTopic);
                if (topicHistory.has(dateNumber)) continue;

                const topicElements = variableTopics.get(itemTopic);
                const elementsToSearch = new Map();
                for (const element of topicElements) {
                    const elementFile = elementToDataFile.get(element);
                    let fileSearches = elementsToSearch.get(elementFile);
                    if (!fileSearches) fileSearches = [];
                    fileSearches.push(element);
                    elementsToSearch.set(elementFile, fileSearches);
                }

                const dateItem = { statusCode: statusHistory[statusHistory.length - 1].status };
                for (let i = 1; i < statusHistory.length; i++) {
                    if (statusHistory[i].time > date.time) {
                        dateItem.statusCode = statusHistory[i - 1].status;
                        break;
                    }
                }

                for (const [searchFileName, searchElements] of elementsToSearch) {
                    const searchFileHistory = domainHistories.get(searchFileName);
                    if (!searchFileHistory) continue;
                    let beforeItem = searchFileHistory[searchFileHistory.length - 1];
                    for (let i = 1; i < searchFileHistory.length; i++) {
                        if (searchFileHistory[i].time > date.time) {
                            beforeItem = searchFileHistory[i - 1];
                            break;
                        }
                    }
                    for (const element of searchElements) {
                        dateItem[element] = beforeItem[element];
                    }
                }

                topicHistory.set(dateNumber, dateItem);
            }
        }
    }

    // Compute diffs
    const domainChanges = {};
    for (const [topic, topicHistory] of newHistories) {
        if (topicHistory.size <= 1) continue;

        const changes = [...topicHistory.entries()].sort((a, b) => b[0] - a[0]);
        for (let i = 0; i < changes.length - 1; i++) {
            const [date, current] = changes[i];
            const changeItem = createChangeItem(topic, date, current, changes[i + 1][1]);
            if (changeItem.oldPercent === changeItem.newPercent) continue;

            const dateStr = String(date);
            if (!domainChanges[dateStr]) domainChanges[dateStr] = [];
            domainChanges[dateStr].push(changeItem);
        }
    }

    if (Object.keys(domainChanges).length > 0) {
        migrated[domainUrl] = domainChanges;
        totalEntries += Object.keys(domainChanges).length;
    }
}

console.log(`Extracted ${totalEntries} date entries across ${Object.keys(migrated).length} domains from old data`);

// Load existing myscangov_changes.json
const existing = JSON.parse(readFileSync('./scripts/data/myscangov_changes.json', 'utf8'));
const existingDomains = Object.keys(existing).length;
let existingEntries = 0;
for (const d of Object.values(existing)) {
    existingEntries += Object.keys(d).length;
}
console.log(`\nExisting myscangov_changes.json: ${existingEntries} date entries across ${existingDomains} domains`);

// Merge: old data goes in first, existing data overwrites (it's newer/more authoritative)
const merged = {};
let newFromOld = 0;
let domainsAdded = 0;

for (const [domain, dates] of Object.entries(migrated)) {
    if (!merged[domain]) merged[domain] = {};
    for (const [dateStr, changes] of Object.entries(dates)) {
        if (!merged[domain][dateStr]) {
            merged[domain][dateStr] = changes;
            if (!existing[domain] || !existing[domain][dateStr]) {
                newFromOld++;
            }
        }
    }
    if (!existing[domain]) domainsAdded++;
}

// Layer existing data on top
for (const [domain, dates] of Object.entries(existing)) {
    if (!merged[domain]) merged[domain] = {};
    for (const [dateStr, changes] of Object.entries(dates)) {
        merged[domain][dateStr] = changes; // existing data wins
    }
}

let mergedEntries = 0;
for (const d of Object.values(merged)) {
    mergedEntries += Object.keys(d).length;
}

console.log(`\nMerge results:`);
console.log(`  New date entries from old data: ${newFromOld}`);
console.log(`  New domains from old data: ${domainsAdded}`);
console.log(`  Total merged: ${mergedEntries} date entries across ${Object.keys(merged).length} domains`);

// Check ca.gov specifically
if (merged['ca.gov']) {
    console.log(`\n  ca.gov: ${Object.keys(merged['ca.gov']).length} date entries`);
}

// Write backup and merged file
const backupPath = './scripts/data/myscangov_changes.backup.json';
writeFileSync(backupPath, JSON.stringify(existing), 'utf8');
console.log(`\nBackup written to ${backupPath}`);

writeFileSync('./scripts/data/myscangov_changes.json', JSON.stringify(merged), 'utf8');
console.log(`Merged data written to scripts/data/myscangov_changes.json`);
