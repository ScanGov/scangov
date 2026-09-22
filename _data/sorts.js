import { scoreSortValue } from '../scripts/counties.js'
import { default as domainData } from './domains.js';
import { addRankingPosition } from './variables.js';
import * as fs from 'fs'

export default function () {

    let domainDataFilled = domainData();

    let sortedData = {};
    sortedData.overall = addRankingPosition(domainDataFilled.sort(function (a, b) {
        return scoreSortValue(b.overallScore) - scoreSortValue(a.overallScore);
    }), null)

    return sortedData;
}
