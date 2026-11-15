// The left nav of the domain and organization pages: which links, in what order,
// with which icons. The list lives in the ScanGov/data repo (profilelinks.json), the
// same file my.scangov.com builds its left nav from, so both sites stay in step.
// Edit the list there, not in _includes/profilelinks.html.
//
// Each item has an `href` per site: "scangov" for a domain page, "scangov-org" for an
// organization page. An item with neither is not shown here. The tokens {slug},
// {status}, {redirect} and {topic} are filled in by the template. Indicators (type
// "topics") expand to one link each, alphabetical, from audits.json.
import { getData } from '../scripts/getdata.js';
import { loadAudits } from '../scripts/load-audits.js';

export default async function () {
    const local = process.env.ELEVENTY_RUN_MODE === 'serve';
    const data = await getData('https://github.com/ScanGov/data/raw/refs/heads/main/profilelinks.json', local);
    const audits = await loadAudits();
    const topics = Object.keys(audits).sort().map(key => ({
        key,
        title: audits[key].displayName,
        icon: audits[key].icon,
    }));
    return {
        items: data.items.filter(item => item.href && (item.href.scangov || item.href['scangov-org'])),
        topics,
    };
}
