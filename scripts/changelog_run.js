import * as fs from 'fs'
import { getData } from './getdata.js'
import { appendChangelog } from './changelog.js';
import { default as domainData } from '../_data/domains.js';

let domainDataFilled = domainData();
const olddata = JSON.parse(fs.readFileSync('./scripts/data/lastscan.json'));
let writeChangelog = await appendChangelog(domainDataFilled, olddata);
