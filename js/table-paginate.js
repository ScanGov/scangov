// Client-side pagination for long tables. Progressive enhancement: the page
// ships every row, this script hides all but one page of them and adds
// Bootstrap-styled controls after the table. Without JavaScript the full
// table shows.
//
// Usage: <table data-paginate="50"> ... </table>
//
// Works with tablesort-init.js: sorting reorders every row in the DOM and
// fires "afterSort" on the table, which resets the view to page 1.
(function () {
  function paginate(table) {
    var pageSize = parseInt(table.getAttribute('data-paginate'), 10) || 50;
    var tbody = table.tBodies[0];
    if (!tbody) return;
    var rows = Array.prototype.slice.call(tbody.rows);
    if (rows.length <= pageSize) return;

    var wrapper = table.closest('.table-responsive') || table;
    var nav = document.createElement('nav');
    nav.className = 'sg-table-pages';
    nav.setAttribute('aria-label', 'Table pages');
    var status = document.createElement('p');
    status.className = 'small text-muted mb-2';
    status.setAttribute('aria-live', 'polite');
    nav.appendChild(status);
    var list = document.createElement('ul');
    list.className = 'pagination flex-wrap mb-0';
    nav.appendChild(list);
    wrapper.parentNode.insertBefore(nav, wrapper.nextSibling);

    var current = 1;
    var unit = table.getAttribute('data-paginate-unit') || 'rows';

    function pageCount() {
      rows = Array.prototype.slice.call(tbody.rows);
      return Math.ceil(rows.length / pageSize);
    }

    function item(label, page, opts) {
      var li = document.createElement('li');
      li.className = 'page-item' + (opts.active ? ' active' : '') + (opts.disabled ? ' disabled' : '');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'page-link';
      btn.textContent = label;
      if (opts.active) btn.setAttribute('aria-current', 'page');
      if (opts.disabled) btn.disabled = true;
      if (opts.label) btn.setAttribute('aria-label', opts.label);
      btn.addEventListener('click', function () { show(page, true); });
      li.appendChild(btn);
      return li;
    }

    function show(page, focusTable) {
      var total = pageCount();
      current = Math.min(Math.max(page, 1), total);
      var start = (current - 1) * pageSize;
      var end = Math.min(start + pageSize, rows.length);
      rows.forEach(function (row, i) { row.hidden = i < start || i >= end; });

      status.textContent = 'Showing ' + (start + 1) + ' to ' + end + ' of ' + rows.length + ' ' + unit;
      list.textContent = '';
      list.appendChild(item('Previous', current - 1, { disabled: current === 1 }));
      for (var p = 1; p <= total; p++) {
        list.appendChild(item(String(p), p, { active: p === current, label: 'Page ' + p }));
      }
      list.appendChild(item('Next', current + 1, { disabled: current === total }));

      if (focusTable) {
        var top = wrapper.getBoundingClientRect().top + window.pageYOffset - 16;
        if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }

    table.addEventListener('afterSort', function () { show(1, false); });
    show(1, false);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('table[data-paginate]').forEach(paginate);
  });
})();
