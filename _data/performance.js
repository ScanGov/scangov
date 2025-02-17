import { default as domainData } from './domains.js'
import { stateDomainList } from './variables.js'
import { cityDomainList } from './variables.js'
import * as fs from 'fs'

export default function () {
  let domainDataFilled = domainData()

  // remove everything from the array that has no score
  const filteredData = domainDataFilled.filter((obj) => 'performance' in obj)

  let performance = {}
  let overall = filteredData.sort(function (a, b) {
    return (
      parseInt(b.scores['performance'].score) -
      parseInt(a.scores['performance'].score)
    )
  })
  performance.overall = overall

  const filteredStatesOnly = overall.filter(
    (obj) => stateDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  performance.states = filteredStatesOnly

  const filteredCitiesOnly = overall.filter(
    (obj) => cityDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  performance.cities = filteredCitiesOnly

  return performance
}
