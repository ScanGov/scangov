import {
    socialDataVariables,
    contentDataVariables,
    securityDataVariables,
    urlDataVariables,
    performanceDataVariables,
    accessibilityDataVariables,
    seoDataVariables
} from './variables.js'

export const createDomainList = (
    metaData, robotsData, securityData, sitemapData,
    urlData, performanceData, accessibilityData
) => {
    let devModeDomainLimit = 50;

    let allDataMap = new Map()
    let allDataArray = []
    let truncateCount = 0

    // Loop through each indicator and add the domain with the indicator to a large list
    metaData.forEach((m) => {
        let newObject = {}
        newObject.metadata = m
        /* create social object */
        newObject.social = {};
        socialDataVariables.forEach(v => {
            newObject.social[v] = m[v];
        })
        newObject.social.url = m.url;
        newObject.social.status = m.status;
        newObject.social.name = m.name;
        /* create content object */
        newObject.content = {};
        contentDataVariables.forEach(v => {
            newObject.content[v] = m[v];
        })
        newObject.content.url = m.url;
        newObject.content.status = m.status;
        newObject.content.name = m.name;
        /* create seo object */
        newObject.seo = {};
        seoDataVariables.forEach(v => {
            if (m[v]) {
                newObject.seo[v] = m[v];
            }
        })
        newObject.seo.url = m.url;
        newObject.seo.status = m.status;
        newObject.seo.name = m.name;

        // Add domain data to top level object
        newObject.urlkey = m.url
        newObject.status = m.status
        newObject.name = m.name
        newObject.redirect = m.redirect
        if (
            process.env.ELEVENTY_RUN_MODE !== 'serve' ||
            truncateCount < devModeDomainLimit ||
            truncateCount > metaData.length - devModeDomainLimit
        ) {
            allDataMap.set(m.url, newObject)
        }
        truncateCount++
    })
    securityData.forEach((s) => {
        let newObject = {}
        if (allDataMap.get(s.url)) {
            newObject = allDataMap.get(s.url)
            newObject.security = s
            allDataMap.set(s.url, newObject)
        }
    })
    robotsData.forEach((r) => {
        let newObject = {}
        if (allDataMap.get(r.url)) {
            newObject = allDataMap.get(r.url)
            for (var attrib in r) {
                newObject.seo[attrib] = r[attrib];
            }
            allDataMap.set(r.url, newObject)
        }
    })
    sitemapData.forEach((s) => {
        let newObject = {}
        if (allDataMap.get(s.url)) {
            newObject = allDataMap.get(s.url)
            for (var attrib in s) {
                newObject.seo[attrib] = s[attrib];
            }
            allDataMap.set(s.url, newObject)
        }
    })
    urlData.forEach((u) => {
        let newObject = {}
        if (allDataMap.get(u.url)) {
            newObject = allDataMap.get(u.url)
            newObject.domain = u
            allDataMap.set(u.url, newObject)
        }
    })
    performanceData.forEach((p) => {
        let newObject = {}
        if (allDataMap.get(p.url)) {
            newObject = allDataMap.get(p.url)
            newObject.performance = p
            allDataMap.set(p.url, newObject)
        }
    })
    accessibilityData.forEach((p) => {
        let newObject = {}
        if (allDataMap.get(p.url)) {
            newObject = allDataMap.get(p.url)
            newObject.accessibility = p
            allDataMap.set(p.url, newObject)
        }
    })

    // compute the grades here
    allDataMap.forEach((d, keys) => {
        let overallPossibleScore = 0;
        let overallScoreCount = 0;
        d.scores = {};

        /* social score calculation */
        let socialTotal = 0
        let socialDataAttributeResults = {}
        socialDataVariables.forEach((v) => {
            if (d.social[v] === true) {
                socialTotal++
            }
            socialDataAttributeResults[v] = d.social[v]
        })
        let socialScore = Math.round(
            (socialTotal / socialDataVariables.length) * 100,
        )
        d.scores['social'] = {
            score: socialScore,
            correct: socialTotal,
            all: socialDataVariables.length,
            attributes: socialDataAttributeResults,
        }
        overallPossibleScore += socialDataVariables.length;
        overallScoreCount += socialTotal;

        /* content score calculation */
        let contentTotal = 0;
        let contentDataAttributeResults = {}
        contentDataVariables.forEach((v) => {
            if (d.content[v] === true) {
                contentTotal++
            }
            contentDataAttributeResults[v] = d.content[v]
        })
        let contentScore = Math.round(
            (contentTotal / contentDataVariables.length) * 100,
        )
        d.scores['content'] = {
            score: contentScore,
            correct: contentTotal,
            all: contentDataVariables.length,
            attributes: contentDataAttributeResults,
        }
        overallPossibleScore += contentDataVariables.length;
        overallScoreCount += contentTotal;

        /* old metadata score section which is now removed
        let metadataTotal = 0
        d.scores = {}
        let metaDataAttributeResults = {}
        metaDataVariables.forEach((v) => {
          if (d.metadata[v] === true) {
            metadataTotal++
          }
          metaDataAttributeResults[v] = d.metadata[v]
        })
        let metadataScore = Math.round(
          (metadataTotal / metaDataVariables.length) * 100,
        )
        d.scores['metadata'] = {
          score: metadataScore,
          correct: metadataTotal,
          all: metaDataVariables.length,
          attributes: metaDataAttributeResults,
        }
        overallPossibleScore += metaDataVariables.length
        overallScoreCount += metadataTotal
        end old metadatasection */


        /* begin combining robots and sitemap into SEO */
        let seoTotal = 0
        let seoAttributeResults = {}
        seoDataVariables.forEach((v) => {
            if (d.seo[v]) {
                // these aren't true false at the moment so translate them
                // status: 200,
                // completion: 1,
                // xml: true,
                let interestingVals = false;
                if (v == 'status') {
                    if (d.seo[v] === 200) {
                        d.seo[v] = true;
                        seoTotal++;
                    }
                    interestingVals = true;
                }
                if (v == 'completion') {
                    if (d.seo[v] === 1) {
                        d.seo[v] = true
                        seoTotal++
                    } else {
                        d.seo[v] = false
                    }
                    interestingVals = true;
                }
                if (!interestingVals) {
                    seoTotal++
                }
            }
            seoAttributeResults[v] = d.seo[v]
        })
        let seoScore = Math.round(
            (seoTotal / (seoDataVariables.length)) * 100,
        )
        d.scores['seo'] = {
            score: seoScore,
            correct: seoTotal,
            all: (seoDataVariables.length),
            attributes: seoAttributeResults,
        }
        overallPossibleScore += (seoDataVariables.length)
        overallScoreCount += seoTotal
        /* end combination of robots and sitemap into SEO */




        let securityTotal = 0
        let securityAttributeResults = {}
        securityDataVariables.forEach((v) => {
            if (d.security[v] === true) {
                securityTotal++
            }
            securityAttributeResults[v] = d.security[v]
        })
        let securityScore = Math.round(
            (securityTotal / securityDataVariables.length) * 100,
        )
        d.scores['security'] = {
            score: securityScore,
            correct: securityTotal,
            all: securityDataVariables.length,
            attributes: securityAttributeResults,
        }
        overallPossibleScore += securityDataVariables.length
        overallScoreCount += securityTotal

        let urlTotal = 0
        let urlAttributeResults = {}
        urlDataVariables.forEach((v) => {
            if (d.domain[v] === true) {
                urlTotal++
            }
            urlAttributeResults[v] = d.domain[v]
        })
        let urlScore = Math.round((urlTotal / urlDataVariables.length) * 100)
        d.scores['domain'] = {
            score: urlScore,
            correct: urlTotal,
            all: urlDataVariables.length,
            attributes: urlAttributeResults,
        }
        overallPossibleScore += urlDataVariables.length
        overallScoreCount += urlTotal

        // performance section
        if (d.performance) {
            let performanceTotal = 0
            let performanceAttributeResults = {}
            performanceDataVariables.forEach((v) => {
                if (d.performance[v] === true) {
                    performanceTotal++
                }
                performanceAttributeResults[v] = d.performance[v]
            })
            let performanceScore = Math.round(
                (performanceTotal / performanceDataVariables.length) * 100,
            )
            d.scores['performance'] = {
                score: performanceScore,
                correct: performanceTotal,
                all: performanceDataVariables.length,
                attributes: performanceAttributeResults,
            }
            overallPossibleScore += performanceDataVariables.length
            overallScoreCount += performanceTotal
        }
        // only adding overall score if there is performance data

        // accessibility section
        if (d.accessibility) {
            let accessibilityTotal = 0
            let accessibilityAttributeResults = {}
            accessibilityDataVariables.forEach((v) => {
                if (d.accessibility[v] === true) {
                    accessibilityTotal++
                }
                accessibilityAttributeResults[v] = d.accessibility[v]
            })
            let accessibilityScore = Math.round(
                (accessibilityTotal / accessibilityDataVariables.length) * 100,
            )
            d.scores['accessibility'] = {
                score: accessibilityScore,
                correct: accessibilityTotal,
                all: accessibilityDataVariables.length,
                attributes: accessibilityAttributeResults,
            }
            if (d.accessibility.remediation) {
                d.scores['accessibility'].remediation = d.accessibility.remediation
            }
            overallPossibleScore += accessibilityDataVariables.length
            overallScoreCount += accessibilityTotal
        }
        // only adding overall score if there is accessibility data

        d.overallPossibleScore = overallPossibleScore
        d.overallScoreCount = overallScoreCount
        d.overallScore = Math.round(
            (overallScoreCount / overallPossibleScore) * 100,
        )

        allDataArray.push(d)
    });

    return allDataArray;
}
