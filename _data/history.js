import { SITEMAP_COMPLETION_THRESHOLD, variablesMap, variableTopics, dataFiles, elementToDataFile } from './variables.js';
import { appendChangelog } from '../scripts/changelog.js';
import { default as domainData } from './domains.js';
import { readFileSync } from 'fs';

const createDateNumber = time => {
    const date = new Date(time);
    // Shift year 4 digits, month 2
    // YYYYMMDD
    return (date.getFullYear() * 100 + (date.getMonth() + 1)) * 100 + date.getDate();
};

export const dateNumberToString = num => {
    let date = num;
    // Get first two digits
    const day = date % 100;
    // Shift two digits
    date = Math.floor(date / 100);
    const month = date % 100;
    date = Math.floor(date / 100);
    // date now only has the year
    return month + '/' + day + '/' + date;
}

const upperCaseTopic = topic => {
    switch (topic) {
        case 'accessibility':
            return 'Accessibility';
        case 'content':
            return 'Content';
        case 'domain':
            return 'Domain';
        case 'performance':
            return 'Performance';
        case 'seo':
            return 'SEO';
        case 'security':
            return 'Security';
        case 'social':
            return 'Social';
    }
};

const createChangeItem = (topic, date, newItem, oldItem) => {
    if (topic === 'seo') {
        // Change non-boolean values to booleans
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
        date,
        oldScore, newScore,
        oldPercent: Math.round(100 * oldScore / oldTotal),
        newPercent: Math.round(100 * newScore / newTotal),
        oldTotal, newTotal
    };
}

const updateTime = parseInt(readFileSync('public/data/updated_time', 'utf8'));

export const domainHistories = (async () => {

    let domainDataFilled = domainData();
    let writeChangelog = await appendChangelog(domainDataFilled);

    const changesFromMyScanGov = JSON.parse(readFileSync('./public/data/myscangov_changes.json'));

    const histories = [
        ['metadata', JSON.parse(readFileSync('./public/data/metadata.json'))],
        ['robots', JSON.parse(readFileSync('./public/data/robots.json'))],
        ['security', JSON.parse(readFileSync('./public/data/security.json'))],
        ['sitemap', JSON.parse(readFileSync('./public/data/sitemap.json'))],
        ['url', JSON.parse(readFileSync('./public/data/url.json'))],
        ['performance', JSON.parse(readFileSync('./public/data/performance.json'))],
        ['accessibility', JSON.parse(readFileSync('./public/data/accessibility.json'))]
    ];
    const domains = new Map();

    for (const history of histories) {
        // Loop through every data file
        for (const domain of history[1]) {
            let obj = domains.get(domain.url);
            if (!obj)
                obj = new Map();

            domain.time = updateTime;
            const domainHistory = domain.history;
            delete domain.history;
            obj.set(history[0] /* field name */, domainHistory.concat(domain));

            domains.set(domain.url, obj);
        }
    }

    const history = [];

    for (const domain of domains) {
        const domainHistories = domain[1];
        const statusHistory = domainHistories.get('url');

        // Create a map for history of each topic
        const newHistories = new Map();
        for (const topic of variableTopics)
            newHistories.set(topic[0], new Map());

        for (const history of domainHistories) {
            // All the scoring elements under the file
            const items = dataFiles.get(history[0]);
            // Loop through every change in the domain's history
            for (const date of history[1]) {
                const dateNumber = createDateNumber(date.time);

                // Loop through all scoring elements
                for (const item of items) {
                    // The new topic the element is in
                    const itemTopic = variablesMap.get(item);
                    const topicHistory = newHistories.get(itemTopic);
                    if (topicHistory.has(dateNumber))
                        // The new history map already has this change in it
                        continue;

                    // Create list of other elements in the same topic to search for
                    const topicElements = variableTopics.get(itemTopic);
                    const elementsToSearch = new Map();
                    for (const element of topicElements) {
                        // Get data file to search in
                        const elementFile = elementToDataFile.get(element);
                        let fileSearches = elementsToSearch.get(elementFile);
                        if (!fileSearches)
                            fileSearches = [];
                        fileSearches.push(element);
                        elementsToSearch.set(elementFile, fileSearches);
                    }

                    const dateItem = { statusCode: statusHistory[statusHistory.length - 1].status /* default to current */ };

                    // Get status at history time
                    // Look for first item past date, then go back one
                    for (let i = 1; i < statusHistory.length; i++) {
                        if (statusHistory[i].time > date.time) {
                            dateItem.statusCode = statusHistory[i - 1].status;
                            break;
                        }
                    }

                    // Loop through all files with elements in new topic
                    for (const file of elementsToSearch) {
                        const fileHistory = domainHistories.get(file[0] /* name of file */);
                        // Loop through every date in file history
                        let beforeItem = fileHistory[fileHistory.length - 1]; // Default to current data if there isn't anything else
                        // Look for first item past date, then go back one
                        for (let i = 1; i < fileHistory.length; i++) {
                            if (fileHistory[i].time > date.time) {
                                beforeItem = fileHistory[i - 1];
                                break;
                            }
                        }
                        for (const element of file[1] /* elements for topic in specific file */)
                            // Set all the values for the new history item
                            dateItem[element] = beforeItem[element];
                    }

                    topicHistory.set(dateNumber, dateItem);
                    newHistories.set(itemTopic, topicHistory);
                }
            }
        }

        const domainChanges = new Map();
        for (const topic of newHistories) {
            if (topic[1].size <= 1)
                continue;

            const changes = [...topic[1].entries()].sort((a, b) => b[0] - a[0]);
            for (let i = 0; i < changes.length - 1; i++) {
                const current = changes[i], date = current[0];
                // Array of all changes for the domain on a day
                let dateChanges = domainChanges.get(date);
                if (!dateChanges)
                    dateChanges = [];

                const changeItem = createChangeItem(topic[0], date, current[1], changes[i + 1][1])
                if (changeItem.oldPercent === changeItem.newPercent)
                    continue;

                dateChanges.push(changeItem);
                domainChanges.set(date, dateChanges);
            }
        }

        // appending additional changes from my.scangov data
        for(var dateItem in changesFromMyScanGov[domain[0]]) {
            domainChanges.set(parseInt(dateItem), changesFromMyScanGov[domain[0]][dateItem]);
        }

        history.push({ url: domain[0], changes: domainChanges });
    }

    return history;
})();