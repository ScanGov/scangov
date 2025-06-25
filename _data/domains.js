import { getData } from '../scripts/getdata.js';

export default async function () {
  let latestScansFile = 'https://github.com/ScanGov/data/raw/refs/heads/main/myscangov_homepage_audits.json';

  let getDataLocally = false;
  if(process.env.ELEVENTY_RUN_MODE === 'serve') {
    getDataLocally = true;
  }

  const scanData = await getData(latestScansFile, getDataLocally);

  return scanData;
}