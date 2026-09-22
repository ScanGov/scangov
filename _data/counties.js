import { scoreSortValue } from '../scripts/counties.js'
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
        return scoreSortValue(b.overallScore) - scoreSortValue(a.overallScore)
    })

    return addRankingPosition(counties, null);
}
