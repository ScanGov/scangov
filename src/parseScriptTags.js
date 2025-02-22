import * as cheerio from 'cheerio';

export function parseScriptTags(domain, html) {
  // Parse HTML
  const nodes = cheerio.load(html);

  // Extract scripts
  const scriptSources = [];
  nodes('script').each((_, tag) => {
    const scriptSrc = nodes(tag).attr('src');
    if (scriptSrc !== null && scriptSrc !== undefined && scriptSrc.trim() !== "") {
      scriptSources.push({
        domain: domain,
        scriptSrc: scriptSrc
      });
    }
  });

  // Return an array of <script> src values
  return scriptSources;
}
