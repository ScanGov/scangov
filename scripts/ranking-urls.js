// Where each page of a topic's rankings lives: /rankings/{topic}/ for all sites and
// /rankings/{cohort}/{topic}/ for a cohort. Page 1 is the base address and the following
// pages add their index, so the second page is {base}1/. The indicator's own page, about
// the indicator and not its table, is /{topic}/ (content/indicators/hub.html).

export function topicHrefs(topic, cohortPath, pageCount) {
    const base = `/rankings/${cohortPath}${topic}/`;
    const hrefs = [];
    for (let i = 0; i < pageCount; i++) hrefs.push(i === 0 ? base : `${base}${i}/`);
    return hrefs;
}
