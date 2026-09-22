import { default as domainJS } from './domains.js';
import slugify from '@sindresorhus/slugify';
import stateNames from './stateNames.json' with { type: 'json' };
import { siteContext } from '../scripts/site-context.js';

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
        // Distinct rankings pages this org's sites appear on (a state's county
        // page, or a group hub), for the links line on the org page.
        const links = new Map();
        for (const d of org.domains) {
            const c = siteContext(d, stateNames);
            links.set(c.rankingsUrl, c.rankingsLabel);
        }
        return {
            name: org.name,
            domains: org.domains.sort((a, b) => b.overallScore - a.overallScore),
            rankingsLinks: [...links.entries()].map(([url, label]) => ({ url, label })),
        };
    });
}
