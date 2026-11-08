import orgPages from './orgPages.js';

// Slugs of the orgs that have a page, for the client-side row renderer in
// _includes/sortcontent.html (it rebuilds rows from the full JSON dataset and
// has to make the same link-or-plain-text decision as the `orgUrl` filter).
export default () => orgPages().map((org) => org.slug);
