// Computed metadata for the per-state county pages (state.html and
// state-topic.html). Every branch falls back to the page's own value so the
// five group templates in this directory are unaffected.
//
// Titles follow the query-bearing pattern from ../notes/plans/06: under 60
// characters before header.html appends the site name.

import { rankingsSchema, toJsonLd } from '../../../scripts/profile-summary.js';

const crumbs = [
  { title: 'Rankings', url: '/rankings/' },
  { title: 'Counties', url: '/rankings/counties/' },
];

function stateOf(data) {
  return data.item ? data.item.state : data.st || null;
}

function topicName(data) {
  return data.item ? data.item.topicInfo.displayName.toLowerCase() : null;
}

export default {
  eleventyComputed: {
    title: (data) => {
      const st = stateOf(data);
      if (!st) return data.title;
      const topic = topicName(data);
      return topic
        ? `${st.name} county websites: ${topic} rankings`
        : `${st.name} county websites ranked by digital experience`;
    },
    description: (data) => {
      const st = stateOf(data);
      if (!st) return data.description;
      const topic = topicName(data);
      return topic
        ? `${topic[0].toUpperCase()}${topic.slice(1)} scores, grades, and the most common failures for ${st.count} ${st.name} county government websites, from ScanGov homepage scans.`
        : `Rankings, grades, and the most common failures for ${st.count} ${st.name} county government websites across accessibility, botability, security, and usability.`;
    },
    breadcrumbParent: (data) => {
      const st = stateOf(data);
      if (!st) return data.breadcrumbParent;
      return data.item
        ? [...crumbs, { title: st.name, url: `/rankings/counties/${st.slug}/` }]
        : crumbs;
    },
    breadcrumbCurrent: (data) => {
      const st = stateOf(data);
      if (!st) return data.breadcrumbCurrent;
      return data.item ? data.item.topicInfo.displayName : st.name;
    },
    // The "Sites: N" line in the jumbotron is rendered by the layout, which
    // cannot see {% set %} calls in the page body, so the override lives here.
    siteCountOverride: (data) => {
      const st = stateOf(data);
      return st ? st.count : data.siteCountOverride;
    },
    // Lets content/rankings/rankings.11tydata.js emit Dataset + ItemList
    // JSON-LD for these pages the same way it does for the group pages.
    member: (data) => {
      if (data.item) return data.item.state.byTopic[data.item.topic];
      if (data.st) return data.st.counties;
      return data.member;
    },
    // Same Dataset + ItemList JSON-LD as ../rankings.11tydata.js. Declared
    // here too because the state pages' `member` and `title` are themselves
    // computed above, and the parent's computed runs before they exist.
    schema: (data) => {
      const st = stateOf(data);
      let member = data.member;
      let title = data.title;
      let description = data.description || String(data.descriptionHtml || '').replace(/<[^>]+>/g, '');
      if (st) {
        member = data.item ? st.byTopic[data.item.topic] : st.counties;
        const topic = topicName(data);
        title = topic
          ? `${st.name} county websites: ${topic} rankings`
          : `${st.name} county websites ranked by digital experience`;
      }
      if (!Array.isArray(member) || !title) return undefined;
      return toJsonLd(rankingsSchema(member, title, description, data.site.url, data.page.url, data.updatedTime?.iso));
    },
  },
};
