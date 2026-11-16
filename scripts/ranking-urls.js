// Where each page of a topic's rankings lives. The all-sites indicator pages sit at
// /{topic}/ (they used to be /rankings/{topic}/); every cohort page stays under
// /rankings/{cohort}/{topic}/. Page 1 is the base address and the following pages add
// their index, so the second page is {base}1/. `legacyHrefs` lists the old addresses of
// the all-sites pages, so each can redirect to its new one
// (content/rankings/redirects/indicator.njk).

export function topicHrefs(topic, cohortPath, pageCount) {
    const base = cohortPath === '' ? `/${topic}/` : `/rankings/${cohortPath}${topic}/`;
    return hrefsFor(base, pageCount);
}

export function legacyHrefs(topic, cohortPath, pageCount) {
    return cohortPath === '' ? hrefsFor(`/rankings/${topic}/`, pageCount) : null;
}

function hrefsFor(base, pageCount) {
    const hrefs = [];
    for (let i = 0; i < pageCount; i++) hrefs.push(i === 0 ? base : `${base}${i}/`);
    return hrefs;
}
