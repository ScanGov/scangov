import { default as domainData } from './domains.js'
import { stateDomainList, cityDomainList, addRankingPosition } from './variables.js';

export default function () {
    let domainDataFilled = domainData()

    let botability = {}
    let currentAttribute = 'botability';
    let overall = domainDataFilled.sort(function (a, b) {
        return (
            parseInt(b.scores[currentAttribute].score) - parseInt(a.scores[currentAttribute].score)
        )
    })
    botability.overall = addRankingPosition(overall, currentAttribute);

    const filteredStatesOnly = overall.filter(
        (obj) => stateDomainList.lastIndexOf(obj.urlkey) > -1,
    )
    botability.states = addRankingPosition(filteredStatesOnly, currentAttribute);

    const filteredCitiesOnly = overall.filter(
        (obj) => cityDomainList.lastIndexOf(obj.urlkey) > -1,
    )
    botability.cities = addRankingPosition(filteredCitiesOnly, currentAttribute);

    const filteredFedsOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) === -1 && stateDomainList.lastIndexOf(obj.urlkey) === -1));
    botability.federal = addRankingPosition(filteredFedsOnly, currentAttribute);

    return botability
}
