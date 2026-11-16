// One entry per indicator in audits.json: the page about the indicator at /{topic}/
// (content/indicators/hub.html). Most of what the page shows comes from the shared
// summaries (siteSummary, pulseCharts, audits); this adds the five highest and five
// lowest scoring sites for the indicator, from the same ranked lists as
// /rankings/{topic}/. Pagination source. Default export only.

import { default as topicRankings } from './topicRankings.js';
import { loadAudits } from '../scripts/load-audits.js';
import { topicKeysFrom } from '../scripts/topics.js';

const SIZE = 5;

export default async function () {
    const audits = await loadAudits();
    const overall = (await topicRankings()).overall;
    return topicKeysFrom(audits).map(topic => {
        const chunks = overall.filter(c => c.topic === topic);
        const first = chunks[0];
        const last = chunks[chunks.length - 1];
        return {
            topic,
            permalink: `/${topic}/`,
            top: first ? first.member.slice(0, SIZE) : [],
            bottom: last ? last.member.slice(-SIZE) : [],
        };
    });
}
