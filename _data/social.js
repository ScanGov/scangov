import { default as domainData } from './domains.js';
import { stateDomainList, cityDomainList, addRankingPosition } from './variables.js';
import * as fs from 'fs'

export default function () {
  let domainDataFilled = domainData()

  let social = {}
  let currentAttribute = 'social';
  let overall = domainDataFilled.sort(function (a, b) {
    return b.scores[currentAttribute].score - a.scores[currentAttribute].score
  })
  social.overall = addRankingPosition(overall, currentAttribute);

  const filteredStatesOnly = overall.filter(
    (obj) => stateDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  social.states = addRankingPosition(filteredStatesOnly, currentAttribute);

  const filteredCitiesOnly = overall.filter(
    (obj) => cityDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  social.cities = addRankingPosition(filteredCitiesOnly, currentAttribute);

  const filteredFedsOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) === -1 && stateDomainList.lastIndexOf(obj.urlkey) === -1 ) );
  social.federal = addRankingPosition(filteredFedsOnly, currentAttribute);

  return social
}
