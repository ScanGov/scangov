// Copy-paste examples for the status code pages (content/status/code.html), by status code.
// The user-agent string and IP address are the ones on https://scangov.com/bot.
const allowlist = {
    title: 'Allow ScanGovBot',
    code: 'User-agent: Mozilla/5.0 (compatible; ScanGovBot/1.0; +https://scangov.com/bot)\nIP address: 44.236.34.143',
};
const robotsAllow = {
    title: 'Allow ScanGovBot in robots.txt',
    code: 'User-agent: ScanGovBot\nAllow: /',
};
const redirectCheck = {
    title: 'See where an address redirects',
    code: '$ curl -I https://example.gov\nHTTP/2 301\nlocation: https://www.example.gov/',
};

export default {
    301: [redirectCheck],
    302: [redirectCheck],
    403: [allowlist],
    429: [allowlist],
    995: [allowlist],
    996: [allowlist],
    997: [{ title: 'Leave out the crawl-delay for ScanGovBot in robots.txt', code: 'User-agent: ScanGovBot\nAllow: /' }],
    998: [robotsAllow],
    999: [allowlist, robotsAllow],
};
