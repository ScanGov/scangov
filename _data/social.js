import { default as domainData } from './domains.js'
import { stateDomainList } from './variables.js'
import { cityDomainList } from './variables.js'
import * as fs from 'fs'

export default function () {
  let domainDataFilled = domainData()

  let social = {}
  let overall = domainDataFilled.sort(function (a, b) {
    return b.scores['social'].score - a.scores['social'].score
  })
  social.overall = overall

  const filteredStatesOnly = overall.filter(
    (obj) => stateDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  social.states = filteredStatesOnly

  const filteredCitiesOnly = overall.filter(
    (obj) => cityDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  social.cities = filteredCitiesOnly

  const filteredFedsOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) === -1 && stateDomainList.lastIndexOf(obj.urlkey) === -1 ) );
  social.federal = filteredFedsOnly;

  return social
}
