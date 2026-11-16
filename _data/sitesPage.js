// The numbers for /sites/ (content/sites.html). See scripts/sites-page.js. Default export only.
import { default as siteSummary } from './siteSummary.js';
import { default as groupSummaries } from './groupSummaries.js';
import { default as orgPages } from './orgPages.js';
import { default as statusGroups } from './statusGroups.js';
import { default as countyStates } from './countyStates.js';
import { default as stateData } from './states.js';
import { default as cityData } from './cities.js';
import { default as federalData } from './federal.js';
import { default as eduData } from './edu.js';
import stateNames from './stateNames.json' with { type: 'json' };
import { loadAudits } from '../scripts/load-audits.js';
import { eduGroupsFor } from '../scripts/edu-groups.js';
import { stateCodeOf } from '../scripts/counties.js';
import { buildSitesPage, buildStateRows } from '../scripts/sites-page.js';

export default async function () {
    const audits = await loadAudits();
    const page = buildSitesPage({
        summary: await siteSummary(),
        groups: await groupSummaries(),
        organizations: await orgPages(),
        statuses: await statusGroups(),
    });
    const counties = typeof countyStates === 'function' ? await countyStates() : countyStates;
    const edu = eduData();
    page.byState = buildStateRows({
        stateNames,
        stateSites: stateData().map(d => ({ urlkey: d.urlkey, name: d.name })),
        countyStates: counties,
        cityStateCodes: cityData().map(stateCodeOf).filter(Boolean),
        eduStates: eduGroupsFor(edu, stateNames, audits).groups.filter(g => g.kind === 'state'),
        federalCount: federalData().length,
        eduCount: edu.length,
    });
    return page;
}
