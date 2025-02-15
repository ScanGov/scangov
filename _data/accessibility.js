import { default as domainData } from './domains.js';
import * as fs from 'fs'

export default function () {

    let domainDataFilled = domainData();

    // remove everything from the array that has no score
    const filteredData = domainDataFilled.filter(obj => 'accessibility' in obj);

    let accessibility = filteredData.sort(function (a, b) {
        return parseInt(b.scores['accessibility'].score) - parseInt(a.scores['accessibility'].score);
    })

    return accessibility;
}
