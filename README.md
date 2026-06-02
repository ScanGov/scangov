# Project ScanGov

## About

[Project ScanGov](https://standards.scangov.org) is a government digital experience monitor.

## Data

Audit data is committed to the repo at `public/data/myscangov_homepage_audits.json`. The build uses this file directly.

To refresh the data, run the fetch script with the `SCANGOV_HASH_SECRET` environment variable (find the value in the closed auditor repo):

```
SCANGOV_HASH_SECRET='...' node scripts/fetch-auditor-data.js
```

The fetch script pulls from the auditor API, filters incomplete records, validates state coverage, and overwrites the data file. Commit the updated file to deploy new data.

If `SCANGOV_HASH_SECRET` is not set, the build skips the fetch and uses the committed data file.

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
