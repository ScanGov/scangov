import { default as domainJS } from './domains.js';
import slugify from '@sindresorhus/slugify';

// Group domains by organization. Keyed by the slugified name (the same slug the
// org page permalink uses) so that name variants that differ only in punctuation
// or diacritics ("State of Hawaii" / "State of Hawaiʻi") share one page instead of
// producing a duplicate-permalink build error. The first-seen name is displayed.
export default () => {
    const domains = domainJS();
    const orgs = new Map();

    for (const domain of domains) {
        const key = slugify(domain.name || '');
        let domainOrg = orgs.get(key);
        if (!domainOrg) {
            domainOrg = { name: domain.name, domains: [] };
            orgs.set(key, domainOrg);
        }
        domainOrg.domains.push(domain);
    }

    return [...orgs.values()].map(org => {
        return {
            name: org.name,
            domains: org.domains.sort((a, b) => b.overallScore - a.overallScore)
        };
    });
}
