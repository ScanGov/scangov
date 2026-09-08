// Pagination source for the per-domain changelog pages: `domain_changelog`
// sliced for the current build role. See _config/build-role.js.
import { default as domainChangelog } from './domain_changelog.js';
import { shardList } from '../_config/build-role.js';

export default function () {
  return shardList(domainChangelog());
}
