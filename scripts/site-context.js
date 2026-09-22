// Where a site sits in the rankings: its group, its hub page, and for county
// sites the state page. Used by profile pages, org pages, and the group data
// files so every "see the rankings" link is built the same way.

import { categoryOf } from './categories.js';
import { stateCodeOf, isCounty, domainKey } from './counties.js';

export const CATEGORY_LABEL = { states: 'state', cities: 'city', counties: 'county', edu: 'higher education', federal: 'federal' };
export const CATEGORY_HUB = { states: '/rankings/states/', cities: '/rankings/cities/', counties: '/rankings/counties/', edu: '/rankings/edu/', federal: '/rankings/federal/' };

export function siteContext(domain, stateNames = {}) {
    const category = categoryOf(domainKey(domain));
    const context = {
        category,
        categoryLabel: CATEGORY_LABEL[category] || category,
        hubUrl: CATEGORY_HUB[category] || '/rankings/',
        stateCode: null,
        stateName: null,
        statePageUrl: null,
    };
    if (category === 'counties' && isCounty(domain)) {
        const code = stateCodeOf(domain);
        const info = code && stateNames[code];
        if (info) {
            context.stateCode = code;
            context.stateName = info.name;
            context.statePageUrl = `/rankings/counties/${info.slug}/`;
        }
    }
    // The rankings page for one indicator: the state page's topic view for
    // counties, the hub's topic view otherwise.
    context.topicUrl = topic => `${context.statePageUrl || context.hubUrl}${topic ? topic + '/' : ''}`;
    // The most specific rankings page for this site.
    context.rankingsUrl = context.statePageUrl || context.hubUrl;
    context.rankingsLabel = context.stateName ? `${context.stateName} county rankings` : `${context.categoryLabel[0].toUpperCase()}${context.categoryLabel.slice(1)} rankings`;
    return context;
}
