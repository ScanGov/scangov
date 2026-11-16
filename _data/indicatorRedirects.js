// The numbered pages /{topic}/1/, /{topic}/2/ ... lived at these addresses for a short time
// when the all-sites indicator rankings were at /{topic}/. They redirect to the rankings,
// which are back at /rankings/{topic}/{n}/. /{topic}/ itself is the indicator's own page
// (content/indicators/hub.html). Feeds content/rankings/redirects/indicator.njk.
// Default export only.

import { default as topicRankings } from './topicRankings.js';

export default async function () {
    const chunks = (await topicRankings()).overall;
    return chunks
        .filter(c => c.pageNumber > 0)
        .map(c => ({ topic: c.topic, pageNumber: c.pageNumber, to: c.url }));
}
