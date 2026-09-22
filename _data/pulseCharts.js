// Chart specs that compare the rankings groups, for Pulse. Built from the
// same summaries as siteSummary.js and groupSummaries.js. Default export only.

import { default as siteSummary } from './siteSummary.js';
import { default as groupSummaries } from './groupSummaries.js';
import { loadAudits } from '../scripts/load-audits.js';
import { gradeDistributionSpec, topicAveragesSpec, rankedGroupsSpec } from '../scripts/charts/specs.js';
import { TOPICS } from '../scripts/counties.js';

const ALL_TOPICS = ['overall', ...TOPICS];

export default async function () {
    const audits = await loadAudits();
    const all = await siteSummary();
    const groups = await groupSummaries();
    const label = t => (audits[t] && audits[t].displayName) || t;
    const fmt = new Intl.NumberFormat('en-US');
    const charts = { groupsGrades: {}, groupsAverages: {} };

    for (const topic of ALL_TOPICS) {
        const topicName = topic === 'overall' ? 'overall' : label(topic).toLowerCase();
        charts.groupsGrades[topic] = gradeDistributionSpec({
            id: `pulse-groups-grades-${topic}`,
            title: `Sites by ${topicName} grade, by group`,
            subtitle: `Share of each group's fully scanned sites in each grade band. ${groups.map(g => `${g.label}: ${fmt.format(g.scoredCount)}`).join('. ')}.`,
            groups: groups.map(g => ({ key: g.key, label: g.label, href: g.hub, distribution: g.gradeDistribution[topic], total: g.scoredCount })),
        });
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
