// The audits.json standards file as the `audits` global. Same cached copy the
// data files and the config filters use (scripts/load-audits.js), so the
// derived topic list in _data/topics.js can never disagree with `audits[topic]`.
import { loadAudits } from '../scripts/load-audits.js';

export default async function () {
    return loadAudits();
}
