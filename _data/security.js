import { default as domainData } from './domains.js';
import { stateDomainList, cityDomainList, addRankingPosition } from './variables.js';
import * as fs from 'fs'

export default function () {
  let domainDataFilled = domainData()

  let security = {};
  let currentAttribute = 'security';
  let overall = domainDataFilled.sort(function (a, b) {
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

  const filteredFedsOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) === -1 && stateDomainList.lastIndexOf(obj.urlkey) === -1 ) );
  security.federal = addRankingPosition(filteredFedsOnly, currentAttribute);

  return security
}
