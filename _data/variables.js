import * as fs from 'fs';

export const metaDataVariables = [
    'title',
    'description',
    'viewport',
    'canonical',
    'ogSiteName',
    'ogType',
    'ogTitle',
    'ogDescription',
    'ogUrl',
    'ogImage',
    'ogImageAlt'
];

export const robotsDataVariables = [
    'valid',
    'allowed',
    'sitemap'
];

export const sitemapDataVariables = [
    'status',
    'xml',
    'completion'
];
export const SITEMAP_COMPLETION_THRESHOLD = 1.00;

export const securityDataVariables = [
    'hsts',
    'csp',
    'xContentTypeOptions',
    'securityTxt'
];

export const urlDataVariables = [
    'https',
    'dotgov',
    'www'
];

export const performanceDataVariables = [
    'ttfb',
    'fcp',
    'lcp',
    'cls',
    'inp'
];

export const accessibilityDataVariables = [
    'a11y-best-practices',
    'a11y-color-contrast',
    'a11y-names-labels',
    'a11y-navigation',
    'a11y-aria',
    'a11y-language',
    'a11y-audio-video',
    'a11y-tables-lists',
    'hidden',
]