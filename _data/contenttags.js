import { default as domainData } from './domains.js'
import { stateDomainList, cityDomainList, addRankingPosition } from './variables.js';
import * as fs from 'fs'

/* this file is named contenttags.js because content is an 11ty reserved word */
export default function () {
  let domainDataFilled = domainData()

  let content = {};
  let currentAttribute = 'content';
  let overall = domainDataFilled.sort(function (a, b) {
    return b.scores[currentAttribute].score - a.scores[currentAttribute].score
  })
  content.overall = addRankingPosition(overall, currentAttribute);

  const filteredStatesOnly = overall.filter(
    (obj) => stateDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  content.states = addRankingPosition(filteredStatesOnly, currentAttribute);

  const filteredCitiesOnly = overall.filter(
    (obj) => cityDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  content.cities = addRankingPosition(filteredCitiesOnly, currentAttribute);

  const filteredFedsOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) === -1 && stateDomainList.lastIndexOf(obj.urlkey) === -1 ) );
  content.federal = addRankingPosition(filteredFedsOnly, currentAttribute);

  return content
}
