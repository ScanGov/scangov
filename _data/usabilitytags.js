import { default as domainData } from './domains.js'
import { stateDomainList, cityDomainList, countyDomainList, eduDomainList, addRankingPosition } from './variables.js';

/* this file is named usabilitytags.js because "content" was an 11ty reserved word
   and the pattern was continued for consistency */
export default function() {
    let domainDataFilled = domainData()

    let usability = {};
    let currentAttribute = 'usability';
    let overall = domainDataFilled.sort(function(a, b) {
        return b.scores[currentAttribute].score - a.scores[currentAttribute].score
    })
    usability.overall = addRankingPosition(overall, currentAttribute);

    const filteredStatesOnly = overall.filter(
        (obj) => stateDomainList.lastIndexOf(obj.urlkey) > -1,
    )
    usability.states = addRankingPosition(filteredStatesOnly, currentAttribute);

    const filteredCitiesOnly = overall.filter(
        (obj) => cityDomainList.lastIndexOf(obj.urlkey) > -1,
    )
    usability.cities = addRankingPosition(filteredCitiesOnly, currentAttribute);

    const filteredCountiesOnly = overall.filter(obj => (countyDomainList.lastIndexOf(obj.urlkey) > -1));
    usability.counties = addRankingPosition(filteredCountiesOnly, currentAttribute);

    const filteredEduOnly = overall.filter(obj => (eduDomainList.lastIndexOf(obj.urlkey) > -1));
    usability.edu = addRankingPosition(filteredEduOnly, currentAttribute);

    const filteredFedsOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) === -1 && stateDomainList.lastIndexOf(obj.urlkey) === -1 && countyDomainList.lastIndexOf(obj.urlkey) === -1 && eduDomainList.lastIndexOf(obj.urlkey) === -1));
    usability.federal = addRankingPosition(filteredFedsOnly, currentAttribute);

    return usability
}
