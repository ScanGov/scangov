import { domainHistories as domains, dateNumberToString } from './history.js';

export default function () {
    let history = [];

    for (const domain of domains)
        for (const change of domain.changes)
            history.push({
                url: domain.url,
                date: change[0],
                changes: change[1]
            });

    history = history
        .sort((a, b) => b.date - a.date);
    history.forEach(h => { h.date = dateNumberToString(h.date) });

    return history;
};
