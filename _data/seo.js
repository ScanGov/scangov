import { default as domainData } from './domains.js'
import { stateDomainList } from './variables.js'
import { cityDomainList } from './variables.js'
import * as fs from 'fs'

export default function () {
  let domainDataFilled = domainData()

  let seo = {}
  let overall = domainDataFilled.sort(function (a, b) {
    return (
      parseInt(b.scores['seo'].score) - parseInt(a.scores['seo'].score)
    )
  })
  seo.overall = overall

  const filteredStatesOnly = overall.filter(
    (obj) => stateDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  seo.states = filteredStatesOnly

  const filteredCitiesOnly = overall.filter(
    (obj) => cityDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  seo.cities = filteredCitiesOnly

  const filteredFedsOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) === -1 && stateDomainList.lastIndexOf(obj.urlkey) === -1 ) );
  seo.federal = filteredFedsOnly;

  return seo
}
