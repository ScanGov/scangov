import { getData } from '../scripts/getdata.js';

export default async function () {
  let auditsFile = 'https://github.com/ScanGov/data/raw/refs/heads/main/standards/audits.json';

  let getDataLocally = false;
  if(process.env.ELEVENTY_RUN_MODE === 'serve') {
    getDataLocally = true;
  }

  const auditData = await getData(auditsFile, getDataLocally);

  return auditData;
}

