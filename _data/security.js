import { default as domainData } from './domains.js';
import { stateDomainList, cityDomainList, countyDomainList, eduDomainList, addRankingPosition } from './variables.js';
import * as fs from 'fs'

export default function() {
    let domainDataFilled = domainData();

    let security = {};
    let currentAttribute = 'security';
    let overall = domainDataFilled.sort(function(a, b) {
        return (
            parseInt(b.scores[currentAttribute].score) -
            parseInt(a.scores[currentAttribute].score)
        )
    })
    security.overall = addRankingPosition(overall, currentAttribute);

    const filteredStatesOnly = overall.filter(
        (obj) => stateDomainList.lastIndexOf(obj.urlkey) > -1,
    )
    security.states = addRankingPosition(filteredStatesOnly, currentAttribute);

    const filteredCitiesOnly = overall.filter(
        (obj) => cityDomainList.lastIndexOf(obj.urlkey) > -1,
    )
    security.cities = addRankingPosition(filteredCitiesOnly, currentAttribute);

    const filteredCountiesOnly = overall.filter(obj => (countyDomainList.lastIndexOf(obj.urlkey) > -1));
    security.counties = addRankingPosition(filteredCountiesOnly, currentAttribute);

    const filteredEduOnly = overall.filter(obj => (eduDomainList.lastIndexOf(obj.urlkey) > -1));
    security.edu = addRankingPosition(filteredEduOnly, currentAttribute);

    const filteredFedsOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) === -1 && stateDomainList.lastIndexOf(obj.urlkey) === -1 && countyDomainList.lastIndexOf(obj.urlkey) === -1 && eduDomainList.lastIndexOf(obj.urlkey) === -1));
    security.federal = addRankingPosition(filteredFedsOnly, currentAttribute);

    return security
}
