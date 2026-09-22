import { scoreSortValue } from '../scripts/counties.js'
import { default as domainData } from './domains.js'
import { cityDomainList, addRankingPosition } from './variables.js'
import * as fs from 'fs'

export default function () {
    let domainDataFilled = domainData()

    let cityDomainData = []

    domainDataFilled.forEach((d) => {
        if (cityDomainList.lastIndexOf(d.urlkey) > -1) {
            cityDomainData.push(d)
        }
    })

    let cities = cityDomainData.sort(function (a, b) {
        return scoreSortValue(b.overallScore) - scoreSortValue(a.overallScore)
    })

    return addRankingPosition(cities, null);
}
