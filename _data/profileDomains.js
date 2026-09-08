// Pagination source for the per-domain profile pages (overview, pulse, details,
// report). The full `domains` data in a single-process build; a slice in a
// profiles shard; empty in the core role. See _config/build-role.js.
import { default as domainJS } from './domains.js';
import { shardList } from '../_config/build-role.js';

export default function () {
  return shardList(domainJS());
}
