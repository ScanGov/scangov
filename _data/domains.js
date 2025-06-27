import * as fs from 'fs';

export default function () {
  // let latestScansFile = 'https://github.com/ScanGov/data/raw/refs/heads/main/myscangov_homepage_audits.json';

  // let getDataLocally = false;
  // if(process.env.ELEVENTY_RUN_MODE === 'serve') {
  //   getDataLocally = true;
  // }

  // const scanData = await getData(latestScansFile, getDataLocally);

  let scanData = JSON.parse(fs.readFileSync('./public/data/myscangov_homepage_audits.json','utf8'));

  return scanData;
}