import { variablesMap, variableTopics, dataFiles, elementToDataFile } from './variables.js';
import { readFileSync } from 'fs';
import { createChangeItem, createDateNumber } from './history_util.js';

const updateTime = parseInt(readFileSync('public/data/updated_time', 'utf8'));

const createHistory = histories => {
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

    let history = [];

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

                    // TODO: the thing is backwards?
                    // it looks like the things aren't added with the right times and the current one isn't accurate
                    // and why is the status messed up?

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

        for (const change of domainChanges)
            history.push({
                url: domain[0],
                date: change[0],
                changes: change[1],
            });
    }

    history = history
        .sort((a, b) => b.date - a.date);
    history.forEach(h => {
        // Get first two digits
        const day = h.date % 100;
        // Shift two digits
        h.date = Math.floor(h.date / 100);
        const month = h.date % 100;
        h.date = Math.floor(h.date / 100);
        // date now only has the year
        h.date = month + '/' + day + '/' + h.date;
    });
    return history;
};

export default function () {
    const metaData = JSON.parse(readFileSync('./public/data/metadata.json'));
    const robotsData = JSON.parse(readFileSync('./public/data/robots.json'));
    const securityData = JSON.parse(readFileSync('./public/data/security.json'));
    const sitemapData = JSON.parse(readFileSync('./public/data/sitemap.json'));
    const urlData = JSON.parse(readFileSync('./public/data/url.json'));
    const performanceData = JSON.parse(readFileSync('./public/data/performance.json'));
    const accessibilityData = JSON.parse(readFileSync('./public/data/accessibility.json'));

    let history = createHistory(new Map([
        ['metadata', metaData],
        ['robots', robotsData],
        ['security', securityData],
        ['sitemap', sitemapData],
        ['url', urlData],
        ['performance', performanceData],
        ['accessibility', accessibilityData]
    ]));

    return history;

    /*
    const loop = (data, variables, name) =>
        data.forEach(d => {
            if (d.history.length === 0)
                return;

            // Add current scores to history
            d.history.push(d);

            updateMap(historyMap, d.url, d.history, variables, name);
        });
    loop(metaData, metaDataVariables, 'Metadata');
    loop(urlData, urlDataVariables, 'URL');
    loop(sitemapData, sitemapDataVariables, 'Sitemap');
    loop(robotsData, robotsDataVariables, 'Robots');
    loop(securityData, securityDataVariables, 'Security');
    loop(performanceData, performanceDataVariables, 'Performance');
    loop(accessibilityData, accessibilityDataVariables, 'Accessibility');

    let changelog = [];
    history.forEach((changes, key) => {
        const domain = key.substring(0, key.indexOf(' '));
        let date = parseInt(key.substring(key.indexOf(' ') + 1));
        const time = date;
        // Take out first two digits
        const day = date % 100;
        date = (date - day) / 100;
        // Take out next two digits
        const month = date % 100;
        date = (date - month) / 100;
        // The date variable only holds the year now
        changelog.push({
            domain,
            time,
            date: month + '/' + day + '/' + date,
            changes
        });
    });
    changelog = changelog.sort((a, b) => b.time - a.time);
    */
    return changelog;
};
