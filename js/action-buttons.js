// Action buttons: Edit, Copy link, Copy, Download, Print, Reset. See
// _includes/action-buttons.html and the buttons skill in ScanGov/skills.
//
// A bar is `[data-actions]` with `data-content` (a selector for the document)
// and `data-filename` (a name without the extension). Any `[data-action]`,
// `[data-copy]` or `[data-download]` button works without a bar, so the Share
// menu in actions.html uses the same code and messages.
//
// A Copy or Download menu lists only the formats that apply. A format that
// needs the document is left out when the page has none. A menu with one
// format becomes a single button, and a menu with none is removed. A site adds
// its own formats with `window.sgActions.register(name, definition)`.
(function () {
  // Some pages include this script more than once. Run once.
  if (window.sgActions) return;

  // ---- Messages ----
  // Instant actions: the button shows a check for 2 seconds and a live region
  // announces it. Failures show a toast, which stays visible for 6 seconds.
  const timers = new WeakMap();
  function icons(button) { return button ? button.querySelectorAll('svg, i') : []; }

  // States are [default, done, busy] icons in the button, in that order.
  function setState(button, state) {
    const list = icons(button);
    const show = { default: 0, done: 1, busy: 2 }[state] || 0;
    if (list.length < 2) return;
    list.forEach(function (icon, index) { icon.classList.toggle('d-none', index !== show); });
    button.disabled = state === 'busy';
  }
  function announce(text) {
    let status = document.getElementById('action-status');
    if (!status) {
      // A page without the region (such as the call-to-action band alone) gets one.
      status = document.createElement('span');
      status.id = 'action-status';
      status.className = 'visually-hidden';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      document.body.appendChild(status);
    }
    status.textContent = '';
    window.setTimeout(function () { status.textContent = text; }, 50);
  }
  function succeed(button, text) {
    announce(text);
    if (!button) return;
    setState(button, 'done');
    window.clearTimeout(timers.get(button));
    timers.set(button, window.setTimeout(function () { setState(button, 'default'); }, 2000));
  }
  // A toast: a failure (danger) or the result of a long action (success). An
  // optional title goes on the first line.
  function toast(type, text, title) {
    let holder = document.getElementById('action-toasts');
    if (!holder) {
      holder = document.createElement('div');
      holder.id = 'action-toasts';
      holder.className = 'toast-container position-fixed bottom-0 start-50 translate-middle-x p-3';
      document.body.appendChild(holder);
    }
    const item = document.createElement('div');
    item.className = 'toast show border-0 text-bg-' + (type === 'danger' ? 'danger' : 'success');
    item.setAttribute('role', type === 'danger' ? 'alert' : 'status');
    const body = document.createElement('div');
    body.className = 'toast-body';
    if (title) {
      const first = document.createElement('div');
      first.textContent = title;
      body.appendChild(first);
    }
    const line = document.createElement('div');
    if (title) line.className = 'small';
    line.textContent = text;
    body.appendChild(line);
    item.appendChild(body);
    holder.appendChild(item);
    window.setTimeout(function () { item.remove(); }, 6000);
  }
  function fail(text) { toast('danger', text); }
  // The button that opened a menu shows the check, not the menu item.
  function owner(button) {
    const menu = button.closest('.dropdown');
    return menu ? menu.querySelector('[data-bs-toggle="dropdown"]') || button : button;
  }

  // ---- The document ----
  function text(node) { return node.textContent.replace(/\s+/g, ' ').trim(); }
  function inline(node) {
    let out = '';
    for (const child of node.childNodes) {
      if (child.nodeType === 3) out += child.textContent.replace(/\s+/g, ' ');
      else if (child.nodeName === 'STRONG' || child.nodeName === 'B') out += '**' + inline(child).trim() + '**';
      else if (child.nodeName === 'EM' || child.nodeName === 'I') out += '*' + inline(child).trim() + '*';
      else if (child.nodeName === 'A') out += '[' + inline(child).trim() + '](' + child.href + ')';
      else if (child.nodeName === 'BR') out += '  \n';
      else out += inline(child);
    }
    return out;
  }
  function blocks(root) {
    const list = [];
    (function walk(node) {
      for (const child of node.children) {
        const name = child.nodeName;
        if (/^H[1-6]$/.test(name)) list.push({ type: 'heading', level: Number(name[1]), text: text(child) });
        else if (name === 'P') list.push({ type: 'paragraph', text: text(child), markdown: inline(child).trim() });
        else if (name === 'UL' || name === 'OL') list.push({ type: 'list', ordered: name === 'OL', items: Array.from(child.children).map(function (item) { return { text: text(item), markdown: inline(item).trim() }; }) });
        else if (name === 'DL') {
          const items = [];
          for (const term of child.querySelectorAll('dt')) items.push({ text: text(term) + ': ' + text(term.nextElementSibling), markdown: '**' + text(term) + ':** ' + inline(term.nextElementSibling).trim() });
          list.push({ type: 'list', ordered: false, items: items });
        } else if (name === 'HR') list.push({ type: 'rule' });
        else if (name !== 'SCRIPT' && name !== 'STYLE') walk(child);
      }
    })(root);
    return list;
  }
  function heading() {
    const h1 = document.querySelector('h1');
    const lead = document.querySelector('.lead');
    return { title: h1 ? text(h1) : document.title, subtitle: lead ? text(lead) : '' };
  }
  function escapeHtml(value) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function headingHtml(head) {
    return '<h1>' + escapeHtml(head.title) + '</h1>' + (head.subtitle ? '<p>' + escapeHtml(head.subtitle) + '</p>' : '');
  }

  function toMarkdown(ctx) {
    const head = heading();
    const lines = ['# ' + head.title, ''];
    if (head.subtitle) lines.push(head.subtitle, '');
    for (const block of blocks(ctx.node)) {
      if (block.type === 'heading') lines.push('#'.repeat(block.level) + ' ' + block.text, '');
      else if (block.type === 'paragraph') lines.push(block.markdown, '');
      else if (block.type === 'rule') lines.push('---', '');
      else {
        block.items.forEach(function (item, index) { lines.push((block.ordered ? index + 1 + '. ' : '- ') + item.markdown); });
        lines.push('');
      }
    }
    return lines.join('\n').replace(/\n{3,}/g, '\n\n');
  }
  function toText(ctx) {
    const head = heading();
    const lines = [head.title.toUpperCase(), ''];
    if (head.subtitle) lines.push(head.subtitle, '');
    for (const block of blocks(ctx.node)) {
      if (block.type === 'heading') lines.push(block.text, '');
      else if (block.type === 'paragraph') lines.push(block.text, '');
      else if (block.type === 'rule') lines.push('');
      else {
        block.items.forEach(function (item, index) { lines.push((block.ordered ? index + 1 + '. ' : '- ') + item.text); });
        lines.push('');
      }
    }
    return lines.join('\n').replace(/\n{3,}/g, '\n\n');
  }
  function toJson(ctx) {
    const head = heading();
    const answers = {};
    const params = new URLSearchParams(location.search);
    for (const key of params.keys()) answers[key] = params.getAll(key);
    const sections = [];
    let section = { heading: null, level: 0, blocks: [] };
    for (const block of blocks(ctx.node)) {
      if (block.type === 'heading') {
        if (section.heading || section.blocks.length) sections.push(section);
        section = { heading: block.text, level: block.level, blocks: [] };
      } else if (block.type === 'paragraph') section.blocks.push({ type: 'paragraph', text: block.text });
      else if (block.type === 'list') section.blocks.push({ type: 'list', ordered: block.ordered, items: block.items.map(function (item) { return item.text; }) });
    }
    sections.push(section);
    return JSON.stringify({ title: head.title, subtitle: head.subtitle, answers: answers, sections: sections }, null, 2);
  }
  function toHtml(ctx, word) {
    const head = heading();
    const body = ctx.node.cloneNode(true);
    for (const script of body.querySelectorAll('script')) script.remove();
    const open = word
      ? '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'
      : '<!doctype html><html lang="en">';
    return open + '<head><meta charset="utf-8"><title>' + escapeHtml(head.title) + '</title></head><body>' + headingHtml(head) + body.innerHTML + '</body></html>';
  }

  // A Word document (.docx) is a zip of XML files. This writes one without a
  // library: the files are stored, not compressed.
  const crcTable = (function () {
    const table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table.push(c >>> 0);
    }
    return table;
  })();
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  function zip(files) {
    const encoder = new TextEncoder();
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    const chunks = [];
    const central = [];
    let offset = 0;
    function header(size, fill) {
      const view = new DataView(new ArrayBuffer(size));
      fill(view);
      return new Uint8Array(view.buffer);
    }
    for (const file of files) {
      const name = encoder.encode(file.name);
      const data = encoder.encode(file.data);
      const crc = crc32(data);
      const local = header(30, function (v) {
        v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, 0, true);
        v.setUint16(10, dosTime, true); v.setUint16(12, dosDate, true); v.setUint32(14, crc, true);
        v.setUint32(18, data.length, true); v.setUint32(22, data.length, true); v.setUint16(26, name.length, true); v.setUint16(28, 0, true);
      });
      chunks.push(local, name, data);
      central.push(header(46, function (v) {
        v.setUint32(0, 0x02014b50, true); v.setUint16(4, 20, true); v.setUint16(6, 20, true); v.setUint16(8, 0x0800, true); v.setUint16(10, 0, true);
        v.setUint16(12, dosTime, true); v.setUint16(14, dosDate, true); v.setUint32(16, crc, true);
        v.setUint32(20, data.length, true); v.setUint32(24, data.length, true); v.setUint16(28, name.length, true);
        v.setUint16(30, 0, true); v.setUint16(32, 0, true); v.setUint16(34, 0, true); v.setUint16(36, 0, true); v.setUint32(38, 0, true); v.setUint32(42, offset, true);
      }), name);
      offset += local.length + name.length + data.length;
    }
    let centralSize = 0;
    for (const part of central) centralSize += part.length;
    const end = header(22, function (v) {
      v.setUint32(0, 0x06054b50, true); v.setUint16(4, 0, true); v.setUint16(6, 0, true);
      v.setUint16(8, files.length, true); v.setUint16(10, files.length, true); v.setUint32(12, centralSize, true); v.setUint32(16, offset, true); v.setUint16(20, 0, true);
    });
    return new Blob(chunks.concat(central, [end]), { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }
  function toDocx(ctx) {
    const head = heading();
    const all = blocks(ctx.node);
    const levels = all.filter(function (b) { return b.type === 'heading'; }).map(function (b) { return b.level; });
    const base = levels.length ? Math.min.apply(null, levels) : 1;
    const xml = function (value) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    const paragraph = function (value, style, extra) {
      return '<w:p><w:pPr>' + (style ? '<w:pStyle w:val="' + style + '"/>' : '') + (extra || '') + '</w:pPr><w:r><w:t xml:space="preserve">' + xml(value) + '</w:t></w:r></w:p>';
    };
    let body = paragraph(head.title, 'Title');
    if (head.subtitle) body += paragraph(head.subtitle);
    for (const block of all) {
      if (block.type === 'heading') body += paragraph(block.text, 'Heading' + Math.min(4, block.level - base + 1));
      else if (block.type === 'paragraph') body += paragraph(block.text);
      else if (block.type === 'rule') body += '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>';
      else block.items.forEach(function (item, index) {
        body += paragraph((block.ordered ? index + 1 + '. ' : '• ') + item.text, 'ListParagraph', '<w:ind w:left="720" w:hanging="360"/>');
      });
    }
    const ns = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
    const heads = [1, 2, 3, 4].map(function (n) {
      return '<w:style w:type="paragraph" w:styleId="Heading' + n + '"><w:name w:val="heading ' + n + '"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="' + (n === 1 ? 360 : 240) + '" w:after="80"/><w:outlineLvl w:val="' + (n - 1) + '"/></w:pPr><w:rPr><w:b/><w:sz w:val="' + [32, 28, 24, 22][n - 1] + '"/></w:rPr></w:style>';
    }).join('');
    const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ' + ns + '><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:spacing w:after="200"/></w:pPr><w:rPr><w:b/><w:sz w:val="44"/></w:rPr></w:style>' + heads +
      '<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="60"/></w:pPr></w:style></w:styles>';
    return zip([
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
      { name: 'word/_rels/document.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: 'word/styles.xml', data: styles },
      { name: 'word/document.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + ns + '><w:body>' + body + '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>' }
    ]);
  }

  // ---- Formats ----
  // `needsDocument` formats are left out of a menu on a page with no document.
  const formats = {
    text: { label: 'Text', extension: 'txt', type: 'text/plain', needsDocument: true, build: toText, copy: function (ctx) { return { 'text/html': headingHtml(heading()) + ctx.node.innerHTML, 'text/plain': toText(ctx) }; } },
    md: { label: 'Markdown', extension: 'md', type: 'text/markdown', needsDocument: true, build: toMarkdown },
    txt: { label: 'Text', extension: 'txt', type: 'text/plain', needsDocument: true, build: toText },
    html: { label: 'HTML', extension: 'html', type: 'text/html', needsDocument: true, build: function (ctx) { return toHtml(ctx, false); } },
    json: { label: 'JSON', extension: 'json', type: 'application/json', needsDocument: true, build: toJson },
    docx: { label: 'Word', extension: 'docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', needsDocument: true, build: toDocx }
  };

  function context(button) {
    const bar = button.closest('[data-actions]');
    const selector = bar && bar.dataset.content;
    const node = selector ? document.querySelector(selector) : null;
    return { bar: bar, node: node, filename: (bar && bar.dataset.filename) || 'document' };
  }
  function hasDocument(bar) {
    const selector = bar && bar.dataset.content;
    const node = selector ? document.querySelector(selector) : null;
    return Boolean(node && node.textContent.trim());
  }

  // ---- Actions ----
  async function copyLink(button) {
    try {
      // A value that starts with a slash is an address on this site.
      const value = button.dataset.copyValue;
      await navigator.clipboard.writeText(value ? (value.charAt(0) === '/' ? location.origin + value : value) : location.href);
      succeed(owner(button), 'Link copied');
    } catch (error) { fail('Could not copy the link. Select the address bar and copy it.'); }
  }
  // The page itself, for the call-to-action band: the canonical link, and the
  // title, description and link, ready to paste into email, Teams, Slack, or a post.
  function pageLink() {
    const canonical = document.querySelector('link[rel="canonical"]');
    return canonical && canonical.href ? canonical.href : location.origin + location.pathname;
  }
  function pageText() {
    const h1 = document.querySelector('h1');
    const description = document.querySelector('meta[name="description"]');
    return [h1 ? h1.textContent.trim().replace(/\s+/g, ' ') : document.title, description ? description.content.trim() : '', pageLink()].filter(Boolean).join('\n');
  }
  async function copyPage(button, value, done) {
    try {
      await navigator.clipboard.writeText(value());
      succeed(owner(button), done);
    } catch (error) { fail('Could not copy. Select the address bar and copy it.'); }
  }
  async function copyDocument(button) {
    const name = button.dataset.copy;
    const format = formats[name];
    const ctx = context(button);
    try {
      if (name === 'text') {
        const parts = format.copy(ctx);
        await navigator.clipboard.write([new ClipboardItem({
          'text/html': new Blob([parts['text/html']], { type: 'text/html' }),
          'text/plain': new Blob([parts['text/plain']], { type: 'text/plain' })
        })]);
      } else {
        await navigator.clipboard.writeText(format.build(ctx));
      }
      succeed(owner(button), format.label + ' copied');
    } catch (error) { fail('Could not copy the ' + format.label.toLowerCase() + '. Select it and copy it yourself.'); }
  }
  function download(button) {
    const format = formats[button.dataset.download];
    const ctx = context(button);
    try {
      const built = format.build(ctx);
      const blob = built instanceof Blob ? built : new Blob([built], { type: format.type + ';charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = ctx.filename + '-' + new Date().toISOString().slice(0, 10) + '.' + format.extension;
      link.click();
      URL.revokeObjectURL(link.href);
      succeed(owner(button), 'Downloaded ' + link.download);
    } catch (error) { fail('Could not download the file. Try again.'); }
  }

  document.addEventListener('click', function (event) {
    const target = event.target.closest('[data-action], [data-copy], [data-download]');
    if (!target) return;
    if (target.dataset.copy) copyDocument(target);
    else if (target.dataset.download) download(target);
    else if (target.dataset.action === 'copy-link') copyLink(target);
    else if (target.dataset.action === 'copy-page-link') copyPage(target, pageLink, 'Link copied');
    else if (target.dataset.action === 'copy-page') copyPage(target, pageText, 'Copied');
    else if (target.dataset.action === 'print') window.print();
    else if (target.dataset.action === 'email') location.href = 'mailto:?subject=' + encodeURIComponent(document.title) + '&body=' + encodeURIComponent(location.href);
  });

  // ---- Setup ----
  function trimMenu(menu) {
    const kind = menu.dataset.menu;
    const items = Array.from(menu.querySelectorAll('li')).filter(function (item) { return item.querySelector('[data-' + kind + ']'); });
    for (const item of items) {
      const button = item.querySelector('[data-' + kind + ']');
      const format = formats[button.dataset[kind]];
      if (!format || (format.needsDocument && !hasDocument(menu.closest('[data-actions]')))) item.remove();
    }
    const left = menu.querySelectorAll('[data-' + kind + ']');
    if (!left.length) { menu.remove(); return; }
    if (left.length > 1) return;
    // One format: a single button, not a menu.
    const toggle = menu.querySelector('[data-bs-toggle="dropdown"]');
    const only = left[0];
    const name = formats[only.dataset[kind]].label;
    const label = (kind === 'copy' ? 'Copy ' : 'Download ') + name;
    toggle.removeAttribute('data-bs-toggle');
    toggle.removeAttribute('aria-expanded');
    toggle.removeAttribute('id');
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
    toggle.dataset[kind] = only.dataset[kind];
    menu.replaceWith(toggle);
  }
  function setup() {
    for (const bar of document.querySelectorAll('[data-actions]')) {
      for (const link of bar.querySelectorAll('[data-keep-query]')) link.href += location.search;
      for (const menu of bar.querySelectorAll('[data-menu]')) trimMenu(menu);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();

  window.sgActions = {
    register: function (name, definition) { formats[name] = definition; },
    succeed: succeed,
    fail: fail,
    toast: toast,
    setState: setState,
    announce: announce
  };
})();
