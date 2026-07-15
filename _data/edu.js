import { default as domainData } from './domains.js'
import { eduDomainList, addRankingPosition } from './variables.js'
import * as fs from 'fs'

export default function() {
    let domainDataFilled = domainData()

    let eduDomainData = []

    domainDataFilled.forEach((d) => {
        if (eduDomainList.lastIndexOf(d.urlkey) > -1) {
            eduDomainData.push(d)
        }
    })

    let edu = eduDomainData.sort(function(a, b) {
        return parseInt(b.overallScore) - parseInt(a.overallScore)
    })

    return addRankingPosition(edu, null);
}
