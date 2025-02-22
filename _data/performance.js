import { default as domainData } from './domains.js';
import { stateDomainList, cityDomainList, addRankingPosition } from './variables.js';
import * as fs from 'fs'

export default function () {
  let domainDataFilled = domainData()

  let performance = {};
  let currentAttribute = 'performance';

  // remove everything from the array that has no score
  const filteredData = domainDataFilled.filter((obj) => currentAttribute in obj)

  let overall = filteredData.sort(function (a, b) {
    return (
      parseInt(b.scores[currentAttribute].score) -
      parseInt(a.scores[currentAttribute].score)
    )
  })
  performance.overall = addRankingPosition(overall, currentAttribute);

  const filteredStatesOnly = overall.filter(
    (obj) => stateDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  performance.states = addRankingPosition(filteredStatesOnly, currentAttribute);

  const filteredCitiesOnly = overall.filter(
    (obj) => cityDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  performance.cities = addRankingPosition(filteredCitiesOnly, currentAttribute);

  const filteredFedsOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) === -1 && stateDomainList.lastIndexOf(obj.urlkey) === -1 ) );
  performance.federal = addRankingPosition(filteredFedsOnly, currentAttribute);

  return performance
}
