// What the rankings pages show above their h1, worked out from the page data so the
// layout (which cannot see {% set %} calls in a page body) can render it: the
// breadcrumb, and the filters (group pills and indicator tabs, rankingtabs.html).
// Used by content/rankings/rankings.11tydata.js. The county state pages and the
// education group pages set their own breadcrumbs in their data files and pass `st`
// or `gp` here for the filters.

export const GROUPS = { states: 'States', counties: 'Counties', cities: 'Cities', federal: 'Federal', edu: 'Education' };

// The URL below /rankings/ as segments: group (if any), then indicator (if any).
function where(data) {
  const parts = String(data.page && data.page.url ? data.page.url : '').split('/').filter(Boolean);
  if (parts[0] === 'rankings') parts.shift();
  const group = GROUPS[parts[0]] ? parts.shift() : '';
  const topic = data.audits && data.audits[parts[0]] ? parts[0] : '';
  return { group, topic };
}

// A list page: it paginates a ranked list (member) or a topic chunk.
export function isRankingList(data) {
  return !!(data.member || data.chunk || data.item || data.gp);
}

export function rankingCrumbs(data) {
  if (!isRankingList(data)) return undefined;
  const { group, topic } = where(data);
  const parents = [];
  if (group || topic) parents.push({ title: 'Rankings', url: '/rankings/' });
  if (group && topic) parents.push({ title: GROUPS[group], url: `/rankings/${group}/` });
  const current = topic ? data.audits[topic].displayName : group ? GROUPS[group] : 'Rankings';
  return { parents, current };
}

// The variables rankingtabs.html reads, as one object for the layout.
export function rankingFilters(data) {
  if (!isRankingList(data)) return undefined;
  const { group, topic } = where(data);
  const st = data.st || (data.item && data.item.state) || null;
  const grp = (data.gp && data.gp.group) || null;
  return {
    currentsort: group,
    specificAttribute: (data.item && data.item.topic) || (data.gp && data.gp.topic) || topic || '',
    stateContext: !!st,
    st,
    groupContext: !!grp,
    grp,
  };
}
