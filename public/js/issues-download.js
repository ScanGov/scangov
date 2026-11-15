// Download a domain's issues as .csv, .json, or .md. Same files as the Download
// menu on my.scangov.com (src/shared/issuesexport.mjs), built in the browser from
// the issues the page carries in #issues-data, so the static build writes no
// extra files. A menu item has data-issues-format (csv, json, md) and
// data-issues-scope (all, or topic for the indicator in the ?attr= parameter).
(function () {
  const CORE_WEB_VITALS = ['cls', 'fcp', 'inp', 'lcp', 'ttfb'];
  const MOBILE_NOTE = '> **Verifying Core Web Vitals fixes:** ScanGov measures these under Lighthouse\'s mobile\n'
    + '> defaults - Slow 4G (~1.6Mbps down / 750Kbps up / 150ms latency), 4x CPU throttling, and full\n'
    + '> mobile device emulation. Verify by running Lighthouse itself in mobile mode, or with a real\n'
    + '> device preset, rather than narrowing a desktop browser window.\n';

  function topicLabel(topic) { return topic.charAt(0).toUpperCase() + topic.slice(1); }
  function csvCell(value) { return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"'; }
  function learnMore(attribute) { return 'https://standards.scangov.org/' + String(attribute).toLowerCase() + '/'; }

  function rows(data) {
    const pageUrl = 'https://' + data.domain + '/';
    return data.issues.map(function (i) {
      return {
        task: pageUrl + ': ' + i.error,
        topic: topicLabel(i.topic),
        standard: i.displayName,
        error: i.error,
        pageTitle: data.domain,
        pageUrl: pageUrl,
        description: i.description,
        why: i.why,
        learnMore: learnMore(i.attribute)
      };
    });
  }

  function buildFile(data, format) {
    if (format === 'json') {
      return { content: JSON.stringify(rows(data), null, 2), type: 'application/json', ext: 'json' };
    }
    if (format === 'md') {
      const byTopic = {};
      data.issues.forEach(function (i) { (byTopic[i.topic] = byTopic[i.topic] || []).push(i); });
      const topics = Object.keys(byTopic);
      const breakdown = topics.map(function (t) { return topicLabel(t) + ': ' + byTopic[t].length; }).join(', ');
      const n = data.issues.length;
      const index = data.issues.map(function (i) { return '> - [ ] ' + topicLabel(i.topic) + ': ' + i.error; }).join('\n');
      const pageUrl = 'https://' + data.domain + '/';
      const preamble = '> ' + data.domain + ' issues found by a ScanGov scan of the homepage.\n'
        + '> ' + n + ' issue' + (n === 1 ? '' : 's') + ' found across ' + topics.length + ' topic' + (topics.length === 1 ? '' : 's')
        + ' (' + breakdown + '). Resolve all of them, not a sample.\n'
        + '> Investigate every issue independently, even ones in the same topic. A page may not have an\n'
        + '> obvious on-page cause; check whether it is a shared template or include before writing a\n'
        + '> bespoke fix. Find the template that renders the exact URL below, matching the full path.\n>\n'
        + '> Issues in this file:\n' + index + '\n\n';
      const body = topics.map(function (t) {
        const list = byTopic[t].map(function (i) {
          return '- [ ] **' + i.error + '**\n'
            + '  - Standard: ' + i.displayName + '\n'
            + '  - About: ' + i.description + '\n'
            + '  - Why it matters: ' + i.why + '\n'
            + '  - Learn more: ' + learnMore(i.attribute) + '\n'
            + '  - Pages:\n    - [ ] ' + pageUrl + '\n';
        }).join('\n');
        const hasVitals = t === 'usability' && byTopic[t].some(function (i) { return CORE_WEB_VITALS.indexOf(i.attribute) !== -1; });
        return '## ' + topicLabel(t) + '\n\n' + (hasVitals ? MOBILE_NOTE + '\n' : '') + list;
      }).join('\n');
      return { content: preamble + body, type: 'text/markdown', ext: 'md' };
    }
    const header = ['Task', 'Topic', 'Standard', 'Error', 'Page Title', 'Page URL', 'Description', 'Why it matters', 'Learn more link'];
    const lines = rows(data).map(function (r) {
      return [r.task, r.topic, r.standard, r.error, r.pageTitle, r.pageUrl, r.description, r.why, r.learnMore].map(csvCell).join(',');
    });
    return { content: [header.map(csvCell).join(',')].concat(lines).join('\n'), type: 'text/csv', ext: 'csv' };
  }

  function readData() {
    const el = document.getElementById('issues-data');
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (e) { return null; }
  }

  function topicFromUrl() { return new URLSearchParams(window.location.search).get('attr'); }

  function download(button) {
    const data = readData();
    if (!data) { if (window.sgActions) window.sgActions.fail('Could not build the file. Try again.'); return; }
    const scope = button.dataset.issuesScope;
    const topic = scope === 'topic' ? topicFromUrl() : null;
    const subset = topic ? { domain: data.domain, issues: data.issues.filter(function (i) { return i.topic === topic; }) } : data;
    const file = buildFile(subset, button.dataset.issuesFormat);
    const name = data.domain + '-' + (topic || 'all') + '-issues.' + file.ext;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([file.content], { type: file.type + ';charset=utf-8' }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    const menu = button.closest('.dropdown');
    const toggle = menu && menu.querySelector('[data-bs-toggle="dropdown"]');
    if (window.sgActions) window.sgActions.succeed(toggle, 'Downloaded ' + name);
  }

  document.addEventListener('click', function (event) {
    const button = event.target.closest('[data-issues-format]');
    if (button) download(button);
  });

  // The indicator group only makes sense once a topic is chosen on the details page.
  const topic = topicFromUrl();
  document.querySelectorAll('[data-issues-topic]').forEach(function (el) {
    if (topic) {
      el.classList.remove('d-none');
      const label = el.querySelector('[data-issues-topic-label]');
      if (label) label.textContent = topicLabel(topic) + ' issues';
    }
  });
})();
