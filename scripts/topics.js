// Topic (indicator) keys and names, derived from audits.json so that a topic
// added in the data repo needs no edit on this site. Pure functions: pass in
// the audits object (scripts/load-audits.js) and get lists back.
//
// Order: alphabetical, with readability pinned last. Its chart hue
// (--sg-indicator-readability) was validated only next to usability's
// purple; between botability's green and security's orange, where the
// alphabet would put it, no hue passes the palette checks. See the auditor's
// docs/readability-topic-plan.md, "Topic color". Every list that shows topics
// side by side (cards, pills, chart rows, sidebar links) uses this order.
//
// When audits.json is unavailable (loadAudits returns {}) the lists fall back
// to the four topics the site has always had, so a fetch failure degrades
// copy rather than emptying every topic list.

export const FALLBACK_TOPICS = ['accessibility', 'botability', 'security', 'usability'];

// Topics that sort after every other topic, in this order.
const PINNED_LAST = ['readability'];

// An audits.json entry is a topic when it carries an attributes list.
export function isTopicEntry(entry) {
    return !!entry && typeof entry === 'object' && Array.isArray(entry.attributes);
}

export function orderTopics(keys) {
    const rank = (k) => PINNED_LAST.indexOf(k);
    return [...new Set(keys)].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

export function topicKeysFrom(audits) {
    const keys = Object.keys(audits || {}).filter((k) => isTopicEntry(audits[k]));
    return keys.length ? orderTopics(keys) : [...FALLBACK_TOPICS];
}

// "overall" first, then the topics: the shape map and summary code iterates.
export function allTopicKeysFrom(audits) {
    return ['overall', ...topicKeysFrom(audits)];
}

export function topicName(audits, key) {
    const entry = audits && audits[key];
    return (entry && entry.displayName) || key[0].toUpperCase() + key.slice(1);
}

// Display names in topic order; capitalized keys when audits.json has none.
export function topicNamesFrom(audits, keys = topicKeysFrom(audits)) {
    return keys.map((k) => topicName(audits, k));
}

// "accessibility, botability, security, and usability" for running prose.
export function topicSentence(audits, keys = topicKeysFrom(audits)) {
    const names = keys.map((k) => topicName(audits, k).toLowerCase());
    if (names.length <= 1) return names.join('');
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}
