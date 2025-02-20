import { default as domainData } from './domains.js'
import { stateDomainList } from './variables.js'
import { cityDomainList } from './variables.js'
import * as fs from 'fs'

/* this file is named contenttags.js because content is an 11ty reserved word */
export default function () {
  let domainDataFilled = domainData()

  let content = {}
  let overall = domainDataFilled.sort(function (a, b) {
    return b.scores['content'].score - a.scores['content'].score
  })
  content.overall = overall

  const filteredStatesOnly = overall.filter(
    (obj) => stateDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  content.states = filteredStatesOnly

  const filteredCitiesOnly = overall.filter(
    (obj) => cityDomainList.lastIndexOf(obj.urlkey) > -1,
  )
  content.cities = filteredCitiesOnly

  const filteredFedsOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) === -1 && stateDomainList.lastIndexOf(obj.urlkey) === -1 ) );
  content.federal = filteredFedsOnly;

  return content
}
