// The status.json definitions (code, label, type, and the scan-status copy) as a map by
// code, for the domain pages. The same file feeds my.scangov.com's Status page.
import { getData } from '../scripts/getdata.js';

export default async function () {
    const local = process.env.ELEVENTY_RUN_MODE === 'serve';
    const defs = await getData('https://github.com/ScanGov/data/raw/refs/heads/main/status.json', local);
    return Object.fromEntries(defs.map(def => [def.code, def]));
}
