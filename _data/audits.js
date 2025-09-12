import { getData } from '../scripts/getdata.js';

export default async function () {
    let auditsFile = 'https://github.com/ScanGov/data/raw/refs/heads/main/standards/audits.json';

    const getDataLocally = process.env.ELEVENTY_RUN_MODE;

    const auditData = await getData(auditsFile, getDataLocally);

    return auditData;
}

