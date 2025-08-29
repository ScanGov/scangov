import {
    IdAttributePlugin,
    InputPathToUrlTransformPlugin,
    HtmlBasePlugin,
} from '@11ty/eleventy'
import { feedPlugin } from '@11ty/eleventy-plugin-rss'
import pluginSyntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import pluginNavigation from '@11ty/eleventy-navigation'
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img'
import { EleventyRenderPlugin } from '@11ty/eleventy'
import * as fs from 'fs'
import pluginFilters from './_config/filters.js'
import fontAwesomePlugin from '@11ty/font-awesome'
import { PurgeCSS } from 'purgecss'
import { getData } from './scripts/getdata.js'
import { appendChangelog } from './scripts/changelog.js';
import { default as domainData } from './_data/domains.js';

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
    let auditsFile = 'https://github.com/ScanGov/data/raw/refs/heads/main/standards/audits.json';
    let getDataLocally = false;
    if (process.env.ELEVENTY_RUN_MODE === 'serve') {
        getDataLocally = true;
    }
    const audits = await getData(auditsFile, getDataLocally);

    eleventyConfig.addPlugin(fontAwesomePlugin)

    // Drafts, see also _data/eleventyDataSchema.js
    eleventyConfig.addPreprocessor('drafts', '*', (data, content) => {
        if (data.draft && process.env.ELEVENTY_RUN_MODE === 'build') {
            return false
        }
    })

    // Copy the contents of the `public` folder to the output folder
    // For example, `./public/css/` ends up in `_site/css/`
    eleventyConfig
        .addPassthroughCopy({
            './public/': '/',
            CNAME: 'CNAME',
        })
        .addPassthroughCopy('./content/feed/pretty-atom-feed.xsl')
        .addPassthroughCopy('./content/map/cities.js')
        .addPassthroughCopy({ './node_modules/leaflet/dist/': '/map/leaflet/' })
    // Run Eleventy when these files change:
    // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

    // Watch content images for the image pipeline.
    eleventyConfig.addWatchTarget('content/**/*.{svg,webp,png,jpeg}')

    // Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
    // Adds the {% css %} paired shortcode
    eleventyConfig.addBundle('css', {
        toFileDirectory: 'dist',
    })
    // Adds the {% js %} paired shortcode
    eleventyConfig.addBundle('js', {
        toFileDirectory: 'dist',
    })

    // Official plugins
    eleventyConfig.addPlugin(pluginSyntaxHighlight, {
        preAttributes: { tabindex: 0 },
    })
    eleventyConfig.addPlugin(pluginNavigation)
    eleventyConfig.addPlugin(HtmlBasePlugin)
    eleventyConfig.addPlugin(InputPathToUrlTransformPlugin)

    // Filters
    eleventyConfig.addPlugin(pluginFilters)

    eleventyConfig.addPlugin(IdAttributePlugin, {
        // by default we use Eleventy’s built-in `slugify` filter:
        // slugify: eleventyConfig.getFilter("slugify"),
        // selector: "h1,h2,h3,h4,h5,h6", // default
    })

    eleventyConfig.addShortcode('currentBuildDate', () => {
        return new Date().toISOString()
    })

    eleventyConfig.addFilter('standardFormatDate', (time) => {
        return new Date(time).toLocaleDateString('en-US', {
            timeZone: 'America/Los_Angeles',
        })
    })

    eleventyConfig.addFilter('scanResultWriteUp', (log, scorekey) => {
        let scoreAttributeCount = 0
        let numCorrect = 0
        let attributesToCheck = []
        for (var a in audits[scorekey].attributes) {
            attributesToCheck.push(audits[scorekey].attributes[a].key)
        }
        for (var attr in log) {
            if (attributesToCheck.indexOf(attr) > -1) {
                if (log[attr]) {
                    numCorrect++
                }
                scoreAttributeCount++
            }
        }
        let score = Math.round((numCorrect / scoreAttributeCount) * 100)
        return `Grade: ${gradeThis(
            score,
        )} / Score: ${score}% (${numCorrect} of ${scoreAttributeCount} tags)`
    })

    function writeStatusIconsForAttribute(log, scorekey) {
        let output = ''
        let attributesToCheck = []
        for (var a in audits[scorekey].attributes) {
            attributesToCheck.push(audits[scorekey].attributes[a].key)
        }
        for (var attr in log) {
            if (attributesToCheck.indexOf(attr) > -1) {
                let attrDisplayName = attr
                audits[scorekey].attributes.forEach((attrEl) => {
                    if (attrEl.key === attr) {
                        attrDisplayName = attrEl.displayName
                    }
                })
                if (log[attr]) {
                    output += ` <span title="${attrDisplayName} (${scorekey})"><i class="fa-solid fa-circle-check text-success" >check</i></span>`
                } else {
                    output += ` <span title="${attrDisplayName} (${scorekey})"><i class="fa-solid fa-circle-xmark text-danger">x</i></span>`
                }
            }
        }
        return output
    }
    eleventyConfig.addFilter('auditStatusIcons', (log, scorekey) => {
        let output = writeStatusIconsForAttribute(log, scorekey)
        return output
    })

    eleventyConfig.addFilter('allAuditStatusIcons', (domainData) => {
        let output = ''
        if (domainData.status !== 200) {
            output = `<span title="Inaccessible (status 500)"><i class="fa-solid fa-circle-exclamation text-warning">!</i></span>`
        } else {
            for (var a in audits) {
                output += writeStatusIconsForAttribute(domainData[a], a)
            }
        }
        return output
    })

    eleventyConfig.addFilter('averageElements', (data) => {
        let elementTally = 0
        let respondingDomains = 0
        let overallPossibleElements = data[0].overallScoreCount
        data.forEach((d) => {
            if (d.status === 200) {
                elementTally += d.overallPossibleScore;
                respondingDomains++
            }
        })
        let averageElements = Math.round(elementTally / respondingDomains)
        return `${averageElements} out of ${overallPossibleElements} elements`
    })

    eleventyConfig.addFilter('averageGrade', (data) => {
        let score = scoreCalc(data)
        let grade = gradeThis(score)
        return grade
    })

    function scoreCalc(data) {
        let totalScore = 0
        let respondingDomains = 0
        data.forEach((d) => {
            if (d.status === 200) {
                totalScore += d.overallScore
                respondingDomains++
            }
        })
        let averageScore = Math.round(totalScore / respondingDomains)
        return averageScore
    }

    eleventyConfig.addFilter('averageScore', (data) => {
        let output = scoreCalc(data)
        return output
    })

    eleventyConfig.addFilter('specificAverageScore', (data, attribute = null) => {
        if (!attribute || attribute === 'overall') {
            return scoreCalc(data)
        } else {
            let totalScores = 0
            let totalItems = 0
            data.forEach((d) => {
                if (d.status === 200) {
                    totalScores += d.scores[attribute].score
                    totalItems++
                }
            })
            return Math.round(totalScores / totalItems)
        }
    })

    eleventyConfig.addFilter('specificAverageElements', (data, attribute) => {
        let elementTally = 0
        let respondingDomains = 0
        let overallPossibleElements = 0

        for (var attr in audits[attribute].attributes) {
            overallPossibleElements++
        }
        data.forEach((d) => {
            if (d.status === 200) {
                for (var attr in audits[attribute].attributes) {
                    let key = audits[attribute].attributes[attr].key
                    if (d[attribute][key] === true) {
                        elementTally++
                    }
                }
                respondingDomains++
            }
        })
        let averageElements = Math.round(elementTally / respondingDomains)
        return `${averageElements} out of ${overallPossibleElements} elements`
    })

    eleventyConfig.addFilter('averageColor', (data) => {
        return gradeColor(scoreCalc(data))
    })

    eleventyConfig.addFilter('logger', (obj) => {
        console.log('logger output:', obj);
        return '';
    })

    eleventyConfig.addFilter('timeSort', (logs) => {
        if (logs) {
            return logs.sort((a, b) => b.time - a.time)
        }
        return []
    })

    eleventyConfig.addPlugin(EleventyRenderPlugin)

    eleventyConfig.addFilter('gradify', (score) => {
        return gradeThis(score)
    })

    function gradeThis(score) {
        if (score >= 90) return 'A'
        if (score >= 80) return 'B'
        if (score >= 70) return 'C'
        if (score >= 60) return 'D'
        return 'F'
    }

    eleventyConfig.addFilter('percentify', (score) => {
        return Math.round(score) + '%'
    })

    eleventyConfig.addFilter('gradify', (score) => {
        return gradeThis(score)
    })

    function gradeThis(score) {
        if (score >= 90) return 'A'
        if (score >= 80) return 'B'
        if (score >= 70) return 'C'
        if (score >= 60) return 'D'
        return 'F'
    }

    eleventyConfig.addFilter('percentify', (score) => {
        return Math.round(score) + '%'
    })

    function gradeColor(score) {
        if (score >= 90) return 'success'
        if (score >= 70) return 'warning'
        if (score >= 0) return 'danger'
        // Gray for non-responding
        return 'secondary'
    }

    async function getData(url, local = false) {
        return new Promise(async (resolve) => {
            if (local) {
                let fileLoc = url.replace('https://github.com/ScanGov/data/raw/refs/heads/main/', '');
                resolve(JSON.parse(fs.readFileSync('../data/' + fileLoc, 'utf8')));
            } else {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Response status: ${response.status}`);
                    }

                    const json = await response.json();
                    console.log('got ' + url);
                    resolve(json);
                } catch (error) {
                    throw new Error(`Fetch error: ${error.message}`);
                }
            }
        });
    }

    eleventyConfig.addFilter('colorify', (score) => {
        return gradeColor(score)
    })

    eleventyConfig.addFilter('encodeParameter', (param) => {
        return encodeURIComponent(param.trim());
    })

    eleventyConfig.on("eleventy.before", async ({ dir, runMode, outputMode }) => {
        let allFileNames = ['accessibility', 'metadata', 'performance', 'robots', 'security', 'sitemap', 'url', 'myscangov_homepage_audits'];
        for (let i = 0; i < allFileNames.length; i++) {
            let filename = allFileNames[i];
            if (process.env.ELEVENTY_RUN_MODE === 'serve' && fs.existsSync(`./public/data/${filename}.json`))
                continue;

            let gitFileData = await getGithubData(`https://github.com/ScanGov/data/raw/refs/heads/main/${filename}.json`);
            fs.writeFileSync(`./public/data/${filename}.json`, gitFileData, 'utf8');
        }
        if (process.env.ELEVENTY_RUN_MODE !== 'serve' || !fs.existsSync(`./public/data/domains.csv`)) {
            let gitCSVFileData = await getGithubData(`https://github.com/ScanGov/data/raw/refs/heads/main/domains.csv`);
            fs.writeFileSync(`./public/data/domains.csv`, gitCSVFileData, 'utf8');
        }
        if (!process.env.NO_UPDATE_TIME) {
            let gitUpdateTime = await getGithubData('https://github.com/ScanGov/data/raw/refs/heads/main/updated_time');
            const currentUpdateTime = fs.readFileSync('./public/data/updated_time', 'utf8');
            if (currentUpdateTime !== gitUpdateTime) {
                fs.writeFileSync('./public/data/updated_time', gitUpdateTime, 'utf8');
            }
        }
        let domainDataFilled = domainData();
        const olddata = JSON.parse(fs.readFileSync('./scripts/data/lastscan.json'));
        let writeChangelog = await appendChangelog(domainDataFilled, olddata);
    });

    eleventyConfig.on(
        'eleventy.after',
        async ({ dir, results, runMode, outputMode }) => {
            const purgeCSSResults = await new PurgeCSS().purge({
                content: [
                    '_site/assets/purge/states.html',
                    '_site/index.html',
                    '_site/changelog/index.html',
                    '_site/rankings/states/index.html',
                    '_site/sorts/accessibility/index.html',
                    '_site/filter/index.html',
                    '_site/profile/ca-gov/report/index.html',
                    '_site/map/index.html',
                ],
                css: ['public/assets/bootstrap/css/bootstrap.min.css'],
            })

            fs.writeFileSync(
                './_site/bootstrap-purged.css',
                purgeCSSResults[0].css,
                'utf8',
            )
        },
    )
}

export const config = {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: ['md', 'njk', 'html', 'liquid', '11ty.js'],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: 'njk',

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: 'njk',

    // These are all optional:
    dir: {
        input: 'content', // default: "."
        includes: '../_includes', // default: "_includes" (`input` relative)
        data: '../_data', // default: "_data" (`input` relative)
        output: '_site',
    },
}



async function getGithubData(url) {
    return new Promise(async (resolve) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.text();
            console.log('got ' + url);
            resolve(json);
        } catch (error) {
            throw new Error(`Fetch error: ${error.message}`);
        }
    });
}
