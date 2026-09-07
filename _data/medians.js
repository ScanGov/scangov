import { default as domainData } from './domains.js';
import { categoryOf } from '../scripts/categories.js';
import { medianScore } from '../scripts/profile-summary.js';

// Median overall score nationally and per ranking category, used by the
// profile summary paragraph ("above the state median of 84%"). Keep this
// file to a single default export: Eleventy loads the module namespace
// instead of the function when a data file also has named exports.
export default function () {
  const domains = domainData();
  const byCategory = { states: [], cities: [], counties: [], edu: [], federal: [] };
  for (const d of domains) byCategory[categoryOf(d.urlkey)].push(d);
  const medians = { all: medianScore(domains) };
  for (const [key, list] of Object.entries(byCategory)) medians[key] = medianScore(list);
  return medians;
}
