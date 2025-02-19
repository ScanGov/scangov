import { default as domainData } from './domains.js'
import { cityDomainList, stateDomainList } from './variables.js'
import * as fs from 'fs'

export default function () {
  let domainDataFilled = domainData()

  let federalDomainData = []

  let noFedMap = new Map()
  cityDomainList.forEach((l) => {
    noFedMap.set(l, l)
  })
  stateDomainList.forEach((l) => {
    noFedMap.set(l, l)
  })

  domainDataFilled.forEach((d) => {
    if (!noFedMap.get(d.urlkey)) {
      federalDomainData.push(d)
    }
  })

  let federal = federalDomainData.sort(function (a, b) {
    return parseInt(b.overallScore) - parseInt(a.overallScore)
  })

  return federal;
}
