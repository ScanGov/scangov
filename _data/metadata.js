import { default as domainData } from './domains.js'
import { stateDomainList } from './variables.js'
import { cityDomainList } from './variables.js'
import * as fs from 'fs'

export default function () {
  let domainDataFilled = domainData()

  let metadata = {}
  let overall = domainDataFilled.sort(function (a, b) {
    return b.scores['metadata'].score - a.scores['metadata'].score
  })
  metadata.overall = overall

  const filteredStatesOnly = overall.filter(
    (obj) => stateDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  metadata.states = filteredStatesOnly

  const filteredCitiesOnly = overall.filter(
    (obj) => cityDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  metadata.cities = filteredCitiesOnly

  return metadata
}
