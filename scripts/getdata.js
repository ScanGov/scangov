import * as fs from 'fs';

// Build-time fetch of a JSON file from the ScanGov data repo (status.json for
// the status pages). The dev server can read a local checkout instead.
//
// Every build job fetches this (five jobs in the sharded deploy), so one
// dropped connection on a GitHub runner used to fail the whole deploy
// (run 42510317256, 2026-11-08: "Fetch error: fetch failed" in one shard,
// fail-fast cancelled the rest). Retry a few times with a pause before
// giving up, and throw from a plain async function so the error is reported
// as a build error, not an unhandled rejection.
const ATTEMPTS = 4;
const PAUSE_MS = [2000, 5000, 10000];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getData(url, local = false) {
  const fileLoc = url.replace('https://github.com/ScanGov/data/raw/refs/heads/main/', '');
  if (local && fs.existsSync('../data/' + fileLoc)) {
    return JSON.parse(fs.readFileSync('../data/' + fileLoc, 'utf8'));
  }
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`Response status: ${response.status}`);
      const json = await response.json();
      console.log('got ' + url + (attempt > 1 ? ` (attempt ${attempt})` : ''));
      return json;
    } catch (error) {
      lastError = error;
      if (attempt < ATTEMPTS) {
        console.warn(`getData: ${url} failed (${error.message}); retrying in ${PAUSE_MS[attempt - 1] / 1000}s`);
        await sleep(PAUSE_MS[attempt - 1]);
      }
    }
  }
  throw new Error(`Fetch error: ${lastError.message} (${url}, ${ATTEMPTS} attempts)`);
}
