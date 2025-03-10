# Running locally

Contents:

- [Quickstart](#quickstart)
- [Running with the website](#running-with-the-website)
    - [Single-level-government](#single-level-government)
- [Running without the website](#running-without-the-website)
- [Customization](#customization)
    - [Custom domains](#custom-domains)
    - [Adding/removing metadata parameters](#addingremoving-metadata-parameters)
    - [Removing WWW validation](#removing-www-validation)

## Quickstart

To use the tool for your own set of domains:
- Clone the repository
- Install [NodeJS](https://nodejs.org/en/download/current)
- Run `npm install`
- Delete `CNAME`
- Update the `User-Agent` [header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent) in the `headers` object in `scraper.js`
- (Optional) [Use custom domains](#custom-domains) or [disable www validation](#removing-www-validation)
- Run `node scraper`
    - To only run one domain from the list, append the domain name to the end of the command (example: `node scraper domain.gov`)
        - Make sure to run the scraper with all domains first
- Run [with](#running-with-the-website) or [without](#running-without-the-website) the website

## Running with the website 
- Install dependencies: ```npm install```
- Run `npm run start` to start the website
- The URL of the local site will be printed
- (Optional) [Publish to GitHub](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll)
- When running and being served locally the list of domains to build on every file change is truncated by a variable in `_data/domains.js`. This can be increased or removed if you want to run the whole dataset locally. Running the ```npm run build``` command will always complete a full dataset backed site build.

### Single-level government

If your organization doesn't have sub-organizations:
- Open `/_includes/jumbotron.html` and search for `single-level`
- Delete or comment out everything between the two comments
- Open `/scripts/home.js`
- Set `MULTI_LEVEL` to false

## Running without the website

If you don't want to have a graphical version and only want to use the data (located in `/data`), delete:
- Any folder starting with `_`
- `/assets`
- `/blog`
- `/css`
- `/scripts`
- `_config.yml`
- `Gemfile` and `Gemfile.lock`
- `/.jekyll-cache` if it exists

## Customization

- [Domain list](#custom-domains)
- [Metadata parameters](#addingremoving-metadata-parameters)
- [www validation](#removing-www-validation)

### Custom domains

To use your own list of domains:
- Open `data/domains.csv`
- Delete all lines except for the first
- Add in your domains in the format `domain,agency` ([example](#example-domains-list))
    - Domains can be any case
    - Domains shouldn't start with `http` or `www`

<a id="example-domains-list">Example list:</a>
```
domain1.gov,Department of X
domain2.gov,Department of Y
domain3.gov,Department of Z
```

To add a single domain:
- Run the scraper as `node scraper new-domain.gov`
- Fill in the organization name

### Adding/removing metadata parameters

To add/remove parameters from the data:
- Open `scrapers.js`
- Edit the `metaTags` (line 5), `metaVariables` (line 54), and `metaCsvVariables` (line 78) arrays
    - Make sure each index lines up (first element in `properties` matches first element in `variables`)

To add/remove parameters to the site:
- Make sure the parameter is in the data
- Open `scripts/variables.js`
- Add an item in the `properties`, `names`, `variables`, and `descriptions` arrays
    - Make sure the name in `variables` matches the one in the data
    - Make sure each index lines up

### Removing WWW validation

If you don't want to check for [www canonicalization](https://scangov.org/docs/canonicalization):
- Open `scripts/util.js`
- Change `CHECK_WWW` to `false`
