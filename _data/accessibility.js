import { default as domainData } from './domains.js';
import { stateDomainList } from './variables.js';
import { cityDomainList } from './variables.js';
import * as fs from 'fs'

export default function () {

    let domainDataFilled = domainData();

    let accessibility = {};

    // remove everything from the array that has no score
    const filteredData = domainDataFilled.filter(obj => 'accessibility' in obj);
    let overall = filteredData.sort(function (a, b) {
        return parseInt(b.scores['accessibility'].score) - parseInt(a.scores['accessibility'].score);
    })
    accessibility.overall = overall;

    const filteredStatesOnly = overall.filter(obj => (stateDomainList.lastIndexOf(obj.urlkey) > -1) );
    accessibility.states = filteredStatesOnly;

    const filteredCitiesOnly = overall.filter(obj => (cityDomainList.lastIndexOf(obj.urlkey) > -1) );
    accessibility.cities = filteredCitiesOnly;

    return accessibility;
}
