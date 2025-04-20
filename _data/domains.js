import { readFileSync } from 'fs';
import { createDomainList } from './ranking.js';

export default function () {
    const metaData = JSON.parse(readFileSync('./public/data/metadata.json'));
    const robotsData = JSON.parse(readFileSync('./public/data/robots.json'));
    const securityData = JSON.parse(readFileSync('./public/data/security.json'));
    const sitemapData = JSON.parse(readFileSync('./public/data/sitemap.json'));
    const urlData = JSON.parse(readFileSync('./public/data/url.json'));
    const performanceData = JSON.parse(readFileSync('./public/data/performance.json'));
    const accessibilityData = JSON.parse(readFileSync('./public/data/accessibility.json'));

    return createDomainList(metaData, robotsData, securityData, sitemapData, urlData, performanceData, accessibilityData);
}
