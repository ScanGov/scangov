// Pagination source for content/rankings/edu/group.html: one entry per
// education group and view (overall plus each indicator). Default export
// only: a named export would make Eleventy paginate the module's export names.

import { default as eduData } from './edu.js';
import stateNames from './stateNames.json' with { type: 'json' };
import { loadAudits } from '../scripts/load-audits.js';
import { topicKeysFrom } from '../scripts/topics.js';
import { eduGroupsFor } from '../scripts/edu-groups.js';

export default async function () {
    const audits = await loadAudits();
    const { groups } = eduGroupsFor(eduData(), stateNames, audits);
    const pages = [];
    for (const group of groups) {
        pages.push({ group, topic: '', topicInfo: null, permalink: group.url });
        for (const topic of topicKeysFrom(audits)) {
            pages.push({ group, topic, topicInfo: audits[topic] || { displayName: topic[0].toUpperCase() + topic.slice(1) }, permalink: `${group.url}${topic}/` });
        }
    }
    return pages;
}
