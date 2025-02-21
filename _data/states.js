import { default as domainData } from './domains.js';
import { stateDomainList, addRankingPosition } from './variables.js';
import * as fs from 'fs'

export default function () {
  let domainDataFilled = domainData()

  let stateDomainData = []

  domainDataFilled.forEach((d) => {
    if (stateDomainList.lastIndexOf(d.urlkey) > -1) {
      stateDomainData.push(d)
    }
  })

  let states = stateDomainData.sort(function (a, b) {
    return parseInt(b.overallScore) - parseInt(a.overallScore)
  })

  return addRankingPosition(states, null);
}
