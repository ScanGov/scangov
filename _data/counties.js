import { default as domainData } from './domains.js'
import { countyDomainList, addRankingPosition } from './variables.js'
import * as fs from 'fs'

export default function() {
    let domainDataFilled = domainData()

    let countyDomainData = []

    domainDataFilled.forEach((d) => {
        if (countyDomainList.lastIndexOf(d.urlkey) > -1) {
            countyDomainData.push(d)
        }
    })

    let counties = countyDomainData.sort(function(a, b) {
        return parseInt(b.overallScore) - parseInt(a.overallScore)
    })

    return addRankingPosition(counties, null);
}
