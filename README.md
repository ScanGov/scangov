# Project ScanGov

## About

[Project ScanGov](https://standards.scangov.org) is a digital experience monitor.

## Data

Audit data is committed to the repo at `public/data/myscangov_homepage_audits.json`. The build uses this file directly.

To refresh the data, run the fetch script with the `SCANGOV_HASH_SECRET` environment variable (find the value in the closed auditor repo):

```
SCANGOV_HASH_SECRET='...' node scripts/fetch-auditor-data.js
```

The fetch script pulls from the auditor API, filters incomplete records, validates state coverage, and overwrites the data file. Commit the updated file to deploy new data.

If `SCANGOV_HASH_SECRET` is not set, the build skips the fetch and uses the committed data file.

The higher education cohort is defined by `_data/edu_institutions.csv` (plus any `.edu` urlkey), a copy of the auditor repo's `scripts/data/edu_institutions.csv`. That file also carries each institution's IPEDS metadata (state, control, type, system, metro, lists, NCAA conference), which drives the education hub and the per-state, system, metro, list and conference pages under `/rankings/edu/`. Rebuild it in the auditor repo (`node scripts/build-edu-institutions.mjs`) and copy it here after the list changes. The dev server and sample builds truncate the domain list; set `SERVE_EDU_STATES=TX,CA` (like `SERVE_STATES` for counties) to keep every education site in those states so the education pages render with real data.

### Build triggers

- **Push to main:** The `deploy-to-ghpages` workflow builds and deploys on every push to main.
- **Manual:** The same workflow can be triggered manually from the GitHub Actions UI via `workflow_dispatch`.

### Build checks

The deploy fails, or warns on the run summary, when the data or the output is short of what the site expects. Everything is a JSON parse or a walk of the built files; nothing is re-rendered.

- **Payload validation** (`scripts/fetch-auditor-data.js`, prepare job): at least 5,000 records, all 50 states plus DC, at least 75% of records graded (status 200), and no more than a 10% drop in domains overall or within any category (states, cities, counties, edu, federal) against the committed file. A newest scan older than 14 days is a warning. On errors the build keeps the committed data file and annotates the run. Records that share a domain (`urlkey`) are collapsed to the newest scan (`scripts/normalize-audit-data.js`), since every page, ranking and sitemap entry is keyed by domain.
- **Page counts** (`scripts/check-build-output.js`, deploy job): every sitemap URL exists on disk, each sitemap section lists at least as many pages as the data has entries for, every profile view and status page is present, and no page contains `undefined`, `NaN`, `null` or `[object Object]` as text. Expected counts come from `content/build-manifest.njk`, which the core build writes to `/data/build-manifest.json` from the same global data the templates paginate.
- **Sitemap completeness** (`scripts/check-sitemap-completeness.js`, deploy job): every built page is listed or deliberately excluded, and `<lastmod>` values parse.
- **Unit tests** (`npm test`, prepare job): the `scripts/*.test.mjs` files, under a second.

Run `npm run check:output` after a local `npm run build` to run the two output checks against `_site/`.

### Data structure

Each domain record includes pre-computed scores per audit topic. The topic list comes from the data repo's `standards/audits.json` at build time (`scripts/topics.js`, `_data/topics.js`), alphabetical with readability last:

- **Accessibility** - Individual Lighthouse accessibility audits
- **Botability** - Crawlability, sitemaps, robots.txt, schema markup
- **Security** - HTTPS, CSP, HSTS, security.txt, .gov domain
- **Usability** - Performance metrics, meta tags, viewport
- **Readability** - Reading level (once the auditor emits it; pages render without it until then)

The auditor API returns only domains audited within the last 30 days that have complete data across the topics listed in `REQUIRED_TOPICS` in `scripts/fetch-auditor-data.js`.

Set `SCANGOV_AUDITS_PATH` to build against a local copy of `audits.json` (the dev server reads `../data/standards/audits.json` on its own).

## Maintainer

[ScanGov](https://scangov.com)

## Contribute

We encourage collaboration.

- [Submit an issue](https://github.com/ScanGov/standards/issues) or pull request
- Post feedback to the `repo-scangov-project` channel in [ScanGov Discord](https://discord.gg/aTCrf8HD)
- [Web form](https://docs.google.com/forms/d/e/1FAIpQLSeKiSG0f07leAwW1QqIMSoDIgTA92m0jVy6NADtiaoPhg4rww/viewform?usp=sharing)

## Related

- [ScanGov Standards](https://standards.scangov.org)

## Contact

[Contact ScanGov](https://docs.scangov.org/contact)
