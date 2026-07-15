import { default as domainData } from './domains.js';
import { stateDomainList, cityDomainList, countyDomainList, eduDomainList, addRankingPosition } from './variables.js';

export default function() {

    let domainDataFilled = domainData();

    let accessibility = {};
    let currentAttribute = 'accessibility';

    // remove everything from the array that has no score
    const filteredData = domainDataFilled.filter(obj => currentAttribute in obj);
    let overall = filteredData.sort(function(a, b) {
        return parseInt(b.scores[currentAttribute].score) - parseInt(a.scores[currentAttribute].score);
    })
    accessibility.overall = addRankingPosition(overall, currentAttribute);

    const filteredStatesOnly = overall.filter(obj => stateDomainList.includes(obj.urlkey));
    accessibility.states = addRankingPosition(filteredStatesOnly, currentAttribute);

    const filteredCitiesOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) > -1));
    accessibility.cities = addRankingPosition(filteredCitiesOnly, currentAttribute);

    const filteredCountiesOnly = overall.filter(obj => (countyDomainList.lastIndexOf(obj.urlkey) > -1));
    accessibility.counties = addRankingPosition(filteredCountiesOnly, currentAttribute);

    const filteredEduOnly = overall.filter(obj => (eduDomainList.lastIndexOf(obj.urlkey) > -1));
    accessibility.edu = addRankingPosition(filteredEduOnly, currentAttribute);

    const filteredFedsOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) === -1 && stateDomainList.lastIndexOf(obj.urlkey) === -1) && countyDomainList.lastIndexOf(obj.urlkey) === -1 && eduDomainList.lastIndexOf(obj.urlkey) === -1);
    accessibility.federal = addRankingPosition(filteredFedsOnly, currentAttribute);

    return accessibility;
}
