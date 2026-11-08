import orgs from './orgs.js';

// Pagination source for content/orgs/*.html: only orgs with more than one
// site. A single-site org page shows one card that links to the profile the
// visitor could have gone to directly, and the ~6,200 of them were most of
// the core build's pages. Templates that name an org use the `orgUrl` filter
// (eleventy.config.js), which links only the orgs that have a page. Records
// with a blank name all slugify to "" and used to render as a nameless org at
// /org/; they get no page either.
export default () => orgs().filter((org) => org.multi && org.slug);
