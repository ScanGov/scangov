import * as fs from 'fs';

export default function () {

  let scanData = JSON.parse(fs.readFileSync('./public/data/myscangov_homepage_audits.json','utf8'));

  return scanData;
}