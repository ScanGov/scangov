// Computed metadata for the education group pages (group.html). Every branch
// falls back to the page's own value, or to the topicRankings chunk on
// topic.html (see ../rankings.11tydata.js, whose computed values these
// override), so index.html and topic.html in this directory are unaffected.
//
// Titles follow the query-bearing pattern from ../notes/plans/06 and stay
// short; a long system or conference name is the one thing that can push a
// title past 60 characters, and the name cannot be cut.

import { rankingsSchema, visibleCrumbs, toJsonLd } from '../../../scripts/profile-summary.js';
import { pageMember, pageTitle, pageDescriptionHtml } from '../../../scripts/topic-rankings.js';

const crumbs = [
  { title: 'Rankings', url: '/rankings/' },
  { title: 'Education', url: '/rankings/edu/' },
];

const fmt = new Intl.NumberFormat('en-US');

function groupOf(data) {
  return data.gp ? data.gp.group : null;
}

function topicName(data) {
  return data.gp && data.gp.topicInfo ? data.gp.topicInfo.displayName.toLowerCase() : null;
}

function groupTitle(g, topic) {
  const base = {
    state: `${g.name} college websites`,
    system: `${g.name} websites`,
    metro: `${g.shortName} research university websites`,
    research: `${g.shortName} research university websites`,
    list: g.titleBase || `${g.name} websites`,
    conference: `${g.name} websites`,
  }[g.kind] || `${g.name} websites`;
  // The long form fits under 60 characters for every state and list; a long
  // system or conference name drops "websites" and the tagline instead.
  const long = `${base} ranked by digital experience`;
  if (long.length <= 60) return topic ? `${base}: ${topic} rankings` : long;
  return topic ? `${g.name}: ${topic} rankings` : `${g.name}: website rankings`;
}

function groupDescription(g, topic, data) {
  const what = topic ? `${topic[0].toUpperCase()}${topic.slice(1)} scores, grades, and the most common failures` : 'Rankings, grades, and the most common failures';
  const scope = g.kind === 'state'
    ? `${fmt.format(g.headlineCount)} public and ${fmt.format(g.count - g.headlineCount)} private college and university websites in ${g.name}`
    : `${fmt.format(g.count)} ${g.headlineNoun.replace(/ sites$/, ' websites')}`;
  return `${what} for ${scope}, from ScanGov homepage scans.`;
}

// Rows for the Dataset and ItemList schema: the headline sections' rows for this view.
function groupMember(g, topic) {
  const key = topic || 'overall';
  return g.sections.filter(s => s.inHeadline).flatMap(s => s.byTopic[key]);
}

export default {
  eleventyComputed: {
    title: (data) => {
      const g = groupOf(data);
      return g ? groupTitle(g, topicName(data)) : pageTitle(data);
    },
    description: (data) => {
      const g = groupOf(data);
      return g ? groupDescription(g, topicName(data), data) : data.description;
    },
    breadcrumbParent: (data) => {
      const g = groupOf(data);
      if (!g) return data.breadcrumbParent;
      return data.gp.topic ? [...crumbs, { title: g.name, url: g.url }] : crumbs;
    },
    breadcrumbCurrent: (data) => {
      const g = groupOf(data);
      if (!g) return data.breadcrumbCurrent;
      return data.gp.topic ? data.gp.topicInfo.displayName : g.name;
    },
    siteCountOverride: (data) => {
      const g = groupOf(data);
      return g ? g.count : data.siteCountOverride;
    },
    member: (data) => {
      const g = groupOf(data);
      return g ? groupMember(g, data.gp.topic) : pageMember(data);
    },
    // Same Dataset + ItemList JSON-LD as ../rankings.11tydata.js, declared
    // here too because the group pages' `member` and `title` are computed
    // above and the parent's computed runs before they exist. Group pages
    // carry the nested breadcrumb they show.
    schema: (data) => {
      const g = groupOf(data);
      let member = pageMember(data);
      let title = pageTitle(data);
      let description = data.description || String(pageDescriptionHtml(data) || '').replace(/<[^>]+>/g, '');
      let breadcrumbs = null;
      if (g) {
        const topic = topicName(data);
        member = groupMember(g, data.gp.topic);
        title = groupTitle(g, topic);
        description = groupDescription(g, topic, data);
        const parents = data.gp.topic ? [...crumbs, { title: g.name, url: g.url }] : crumbs;
        const current = data.gp.topic ? data.gp.topicInfo.displayName : g.name;
        breadcrumbs = visibleCrumbs(parents, current, data.page.url);
      }
      if (!Array.isArray(member) || !title) return undefined;
      return toJsonLd(rankingsSchema(member, title, description, data.site.url, data.page.url, data.updatedTime?.iso, data.audits, breadcrumbs));
    },
  },
};
