// The Pages view of a domain (?attr=pages), laid out like the Pages page on
// my.scangov.com: indicator tabs, a standards select for the chosen indicator, and a
// table with the issue count for each page. scangov.org scans the homepage only, so
// the table has one row. Issues come from the #issues-data block that actions.html
// writes; nothing is fetched.
(function () {
  const cell = document.getElementById('pages-issues');
  const dataEl = document.getElementById('issues-data');
  if (!cell || !dataEl) return;
  let data;
  try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
  const view = document.getElementById('details-pages');
  const tabs = Array.from(view.querySelectorAll('.js-filter-trigger'));
  const selects = Array.from(view.querySelectorAll('.js-subfilters'));
  const dashboard = document.querySelector('#details-pages #pages-table a');

  function render() {
    const active = view.querySelector('.js-filter-trigger.active');
    const topic = active ? active.dataset.topicKey : 'all';
    const select = selects.find(function (el) { return el.dataset.topicKey === topic; });
    const standard = select && select.value.indexOf(':') > -1 ? select.value.split(':')[1] : null;
    const fails = data.issues.filter(function (issue) {
      return (topic === 'all' || issue.topic === topic) && (!standard || issue.attribute === standard);
    }).length;
    if (fails === 0) {
      cell.innerHTML = '<i class="fa-solid fa-circle-check text-success" aria-hidden="true"></i><span class="visually-hidden">Passed</span>';
    } else {
      const link = document.createElement('a');
      link.href = dashboard ? dashboard.getAttribute('href') : '#';
      link.textContent = String(fails);
      cell.replaceChildren(link);
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function (event) {
      event.preventDefault();
      tabs.forEach(function (other) { other.classList.toggle('active', other === tab); });
      selects.forEach(function (el) { el.classList.toggle('d-none', el.dataset.topicKey !== tab.dataset.topicKey); el.selectedIndex = 0; });
      render();
    });
  });
  selects.forEach(function (el) { el.addEventListener('change', render); });
  render();
})();
