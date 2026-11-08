// Surface a build message where someone will see it. Locally that is the
// console. On GitHub Actions a `::warning::` / `::error::` line becomes an
// annotation on the run summary page, and the step summary gets a copy, so a
// data problem that the build tolerated (prepare-data.js falls back to the
// previous data file) does not hide in a log nobody opens.
import { appendFileSync } from 'fs';

const onActions = !!process.env.GITHUB_ACTIONS;

export function ciAnnotate(level, title, lines = []) {
  const detail = lines.length ? `\n${lines.map((l) => `  ${l}`).join('\n')}` : '';
  if (level === 'error') console.error(`${title}${detail}`);
  else console.warn(`${title}${detail}`);
  if (!onActions) return;
  // Annotations are single-line; newlines must be URL-encoded.
  const text = [title, ...lines].join('%0A');
  console.log(`::${level === 'error' ? 'error' : 'warning'}::${text}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const body = `### ${level === 'error' ? '❌' : '⚠️'} ${title}\n\n${lines.map((l) => `- ${l}`).join('\n')}\n\n`;
    try {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, body);
    } catch {
      // The summary is a convenience; never fail a build over it.
    }
  }
}
