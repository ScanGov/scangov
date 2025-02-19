import { default as domainData } from './domains.js';
import { stateDomainList } from './variables.js';
import { cityDomainList } from './variables.js';
import * as fs from 'fs'

export default function () {
  let domainDataFilled = domainData()

  let url = {}
  let overall = domainDataFilled.sort(function (a, b) {
    return parseInt(b.scores['url'].score) - parseInt(a.scores['url'].score)
  })
  url.overall = overall

  const filteredStatesOnly = overall.filter(
    (obj) => stateDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  url.states = filteredStatesOnly

  const filteredCitiesOnly = overall.filter(
    (obj) => cityDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  url.cities = filteredCitiesOnly

  const filteredFedsOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) === -1 && stateDomainList.lastIndexOf(obj.urlkey) === -1 ) );
  url.federal = filteredFedsOnly; 

  return url
}
