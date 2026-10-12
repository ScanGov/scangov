// The site's topic (indicator) lists, derived from audits.json at build time
// (scripts/topics.js) instead of being hardcoded: alphabetical with
// readability last. Replaces the `data` and `mapFields` arrays that used to
// live in site.json.
//
//   topics.keys       ['accessibility', 'botability', 'security', 'usability', ...]
//   topics.names      ['Accessibility', 'Botability', ...] (display names)
//   topics.all        ['overall', ...keys]
//   topics.mapFields  ['Overall', ...names]
//   topics.sentence   "accessibility, botability, security, and usability"
//
// Default export only: a named export would make Eleventy load the module
// namespace instead of this function.

import { loadAudits } from '../scripts/load-audits.js';
import { topicKeysFrom, topicNamesFrom, topicSentence } from '../scripts/topics.js';

export default async function () {
    const audits = await loadAudits();
    const keys = topicKeysFrom(audits);
    const names = topicNamesFrom(audits, keys);
    return {
        keys,
        names,
        all: ['overall', ...keys],
        mapFields: ['Overall', ...names],
        sentence: topicSentence(audits, keys),
    };
}
