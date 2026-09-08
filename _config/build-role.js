// Sharded builds. Eleventy keeps every rendered page in memory until the build
// ends, so one process cannot scale with the number of domains. The deploy
// workflow therefore runs several Eleventy processes and merges their output:
//
//   BUILD_ROLE unset            one process builds everything (local default)
//   BUILD_ROLE=core             every page except the per-domain profile pages
//   BUILD_ROLE=profiles         only the profile pages, for the domains in
//   BUILD_SHARD=i/n             shard i of n (1-based): every n-th domain
//
// The `domains` global data stays complete in every role (rankings, orgs and
// medians need it); only the pagination sources for profile pages are sliced,
// via shardList(). See scripts/merge-shards.js and the deploy workflow.

const role = process.env.BUILD_ROLE || '';
if (role && !['core', 'profiles'].includes(role)) {
  throw new Error(`BUILD_ROLE must be "core", "profiles" or unset (got "${role}")`);
}

let shard = null;
if (role === 'profiles') {
  const m = /^(\d+)\/(\d+)$/.exec(process.env.BUILD_SHARD || '');
  if (!m) throw new Error('BUILD_ROLE=profiles needs BUILD_SHARD=i/n (e.g. 1/4)');
  shard = { index: parseInt(m[1], 10), count: parseInt(m[2], 10) };
  if (shard.index < 1 || shard.index > shard.count) {
    throw new Error(`BUILD_SHARD index out of range: ${process.env.BUILD_SHARD}`);
  }
}

export const isCore = role === 'core';
export const isProfiles = role === 'profiles';
export const isSingle = role === '';
export const buildShard = shard;

// Slice a pagination source for the current role. Deterministic on list order,
// so every shard sees the same domain ordering from the data file.
export function shardList(list) {
  if (isCore) return [];
  if (isProfiles) return list.filter((_, i) => i % shard.count === shard.index - 1);
  return list;
}

export function describeRole() {
  if (isCore) return 'core (all pages except profiles)';
  if (isProfiles) return `profiles shard ${shard.index}/${shard.count}`;
  return 'single process (all pages)';
}
