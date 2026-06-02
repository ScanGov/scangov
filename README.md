# Project ScanGov

## About

[Project ScanGov](https://standards.scangov.org) is a government digital experience monitor.

## Data

Audit data is fetched from the auditor API at build time. The `eleventy.before` hook in `eleventy.config.js` calls `scripts/fetch-auditor-data.js`, which:

1. Fetches domain audit data from `https://audits.my.scangov.com/all?homepages=true`
2. Filters out incomplete records (missing scores, NaN values, etc.)
3. Writes the result to `public/data/myscangov_homepage_audits.json`

In serve mode, the fetch is skipped if the data file already exists. To force a refresh, delete the file and restart the dev server.

To fetch data manually:

```
node scripts/fetch-auditor-data.js
```

### Build triggers

- **Push to main:** The `deploy-to-ghpages` workflow builds and deploys on every push to main.
- **Manual:** The same workflow can be triggered manually from the GitHub Actions UI via `workflow_dispatch`.

### Data structure

Each domain record includes pre-computed scores across 4 audit topics:

- **Accessibility** - Individual Lighthouse accessibility audits
- **Botability** - Crawlability, sitemaps, robots.txt, schema markup
- **Security** - HTTPS, CSP, HSTS, security.txt, .gov domain
- **Usability** - Performance metrics, meta tags, readability, viewport

The auditor API returns only domains audited within the last 30 days that have complete data across all 4 topics.

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
