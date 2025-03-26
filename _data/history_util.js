import { SITEMAP_COMPLETION_THRESHOLD, variableTopics } from './variables.js';

export const createDateNumber = time => {
    const date = new Date(time);
    // Shift year 4 digits, month 2
    // YYYYMMDD
    return (date.getFullYear() * 100 + (date.getMonth() + 1)) * 100 + date.getDate();
};

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

export const createChangeItem = (topic, date, newItem, oldItem) => {
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

export const updateMap = (map, url, history, variables, name) => {
    for (let i = 0; i < history.length - 1; i++) {
        const current = history[i], next = history[i + 1];

        // Calculate history scores
        let oldScore = 0, newScore = 0;
        let oldTotal = 0, newTotal = 0;
        for (let j = 0; j < variables.length; j++) {
            const variable = variables[j];
            if (name === 'Sitemap') {
                oldTotal = 3, newTotal = 3;
                switch (variable) {
                    case 'status':
                        oldScore += current.status === 200;
                        newScore += next.status === 200;
                        break;
                    case 'xml':
                        oldScore += current.xml;
                        newScore += next.xml;
                        break;
                    case 'completion':
                        oldScore += current.completion >= SITEMAP_COMPLETION_THRESHOLD;
                        newScore += next.completion >= SITEMAP_COMPLETION_THRESHOLD;
                        break;
                }
            }
            else {
                const currentHasVariable = variable in current;
                oldScore += currentHasVariable && !!current[variable];
                oldTotal += currentHasVariable;
                const nextHasVariable = variable in next;
                newScore += nextHasVariable && !!next[variable];
                newTotal += nextHasVariable;
            }
        }

        // Score didn't change, skip
        if (oldScore === newScore)
            continue;

        const mapKey = url + ' ' + createDateNumber(current.time);

        if (!map.has(mapKey))
            // Create array for change items
            map.set(mapKey, []);

        map.get(mapKey).push({ name, oldScore, newScore, oldTotal, newTotal });
    }
};
