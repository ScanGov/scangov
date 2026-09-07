import { stateDomainList, cityDomainList, countyDomainList, eduDomainList } from '../_data/variables.js';

// Which rankings category a domain belongs to, matching _data/federal.js:
// anything not in the state, city, county, or edu lists is federal.
export function categoryOf(urlkey) {
  if (stateDomainList.includes(urlkey)) return 'states';
  if (cityDomainList.includes(urlkey)) return 'cities';
  if (countyDomainList.includes(urlkey)) return 'counties';
  if (eduDomainList.includes(urlkey)) return 'edu';
  return 'federal';
}
