// Chart specs that compare the rankings groups, for Pulse. Built from the
// same summaries as siteSummary.js and groupSummaries.js. Default export only.

import { default as siteSummary } from './siteSummary.js';
import { default as groupSummaries } from './groupSummaries.js';
import { loadAudits } from '../scripts/load-audits.js';
import { gradeDistributionSpec, topicAveragesSpec, rankedGroupsSpec, pieFromGradeBar } from '../scripts/charts/specs.js';
import { topicKeysFrom, allTopicKeysFrom } from '../scripts/topics.js';

export default async function () {
    const audits = await loadAudits();
    const TOPICS = topicKeysFrom(audits);
    const ALL_TOPICS = allTopicKeysFrom(audits);
    const all = await siteSummary();
    const groups = await groupSummaries();
    const label = t => (audits[t] && audits[t].displayName) || t;
    const fmt = new Intl.NumberFormat('en-US');
    const charts = { groupsGradePies: {}, groupsAverages: {} };

    for (const topic of ALL_TOPICS) {
        const topicName = topic === 'overall' ? 'overall' : label(topic).toLowerCase();
        // One pie per group: each group's fully scanned sites add up to 100%, so a pie
        // reads at a glance where one stacked bar per group did not.
        charts.groupsGradePies[topic] = groups.map(g => pieFromGradeBar(gradeDistributionSpec({
            id: `pulse-grades-${g.key}-${topic}`,
            title: g.label,
            subtitle: `${fmt.format(g.scoredCount)} sites`,
            titleHref: g.hub + (topic === 'overall' ? '' : topic + '/'),
            headingLevel: 3,
            groups: [{ key: g.key, label: g.label, href: g.hub, distribution: g.gradeDistribution[topic], total: g.scoredCount }],
        })));
        charts.groupsAverages[topic] = rankedGroupsSpec({
            id: `pulse-groups-average-${topic}`,
            title: `Average ${topicName} score by group`,
            subtitle: `Mean ${topicName} score of each group's fully scanned sites, 0 to 100. All sites: ${all.averages[topic]}.`,
            labelHeader: 'Group', valueHeader: `Average ${topicName} score`,
            groups: groups.filter(g => g.scoredCount > 0).map(g => ({ key: g.key, label: g.label, href: g.hub, value: g.averages[topic], detail: `${fmt.format(g.scoredCount)} sites` })),
        });
    }

    charts.indicatorAverages = topicAveragesSpec({
        id: 'pulse-indicators',
        title: 'Average score by indicator, all sites',
        subtitle: `Mean score of the ${fmt.format(all.scoredCount)} fully scanned sites for each indicator, 0 to 100, with the state group's average for comparison.`,
        topics: TOPICS.map(t => ({ key: t, label: label(t) })),
        averages: all.averages,
        benchmarks: (groups.find(g => g.key === 'states') || { averages: {} }).averages,
        seriesLabel: 'All sites', benchmarkLabel: 'State sites',
        hrefFor: t => `/rankings/${t}/`,
    });

    return charts;
}
