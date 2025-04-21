import { default as domainJS } from './domains.js';

export default () => {
    const domains = domainJS();
    const orgs = new Map();

    for (const domain of domains) {
        let domainOrg = orgs.get(domain.name);
        if (!domainOrg)
            domainOrg = [];

        domainOrg.push(domain);

        orgs.set(domain.name, domainOrg);
    }

    return [...orgs.entries()].map(org => {
        return {
            name: org[0],
            domains: org[1].sort((a, b) => b.overallScore - a.overallScore)
        };
    });
}
