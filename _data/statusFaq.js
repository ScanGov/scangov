// Questions and answers for /status/, plain text so the page and its FAQPage schema match word for word.
export default [
    {
        q: 'Why was my site not scanned?',
        a: 'Our scanner could not load your homepage or read its content. The usual causes are a firewall or bot protection that turns automated visitors away, a robots.txt rule that blocks bots, a redirect, or a site that was down or slow when we visited. Find your status code in the table to see the exact reason and what to do.',
    },
    {
        q: 'What is ScanGovBot and how do I allow it?',
        a: 'ScanGovBot is the name our scanner uses when it visits a site. It crawls slowly and only reads the homepage. If your site uses a firewall, CDN or bot protection, ask whoever manages it to allow ScanGovBot by name, and make sure robots.txt does not block it.',
    },
    {
        q: 'What does a 403 Forbidden status mean?',
        a: 'Your server understood the request but refused it. This often means a security setting is turning visitors away and catching good bots too. Ask whoever manages your security settings to let good bots through.',
    },
    {
        q: 'What does a 404 Not Found status mean?',
        a: 'The address we have for your homepage does not exist on your server. Put the page back, or send the address to wherever the content lives now, then update any menus or links that still point there.',
    },
    {
        q: 'What is the difference between a 301 and a 302 redirect?',
        a: 'A 301 says the address moved permanently, and a 302 says it moved temporarily. Search engines treat them differently, so use a 301 for a permanent move and remove a 302 once it is no longer needed. Linking straight to the final address avoids both.',
    },
    {
        q: 'Does a status other than 200 hurt my site?',
        a: 'A site that does not load for our scanner often does not load for search engines and AI crawlers either, so it can be harder to find. Redirects and blocked requests are worth fixing even when visitors see the page normally.',
    },
];
