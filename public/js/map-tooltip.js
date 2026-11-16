// A hover tip for the dots and counties on the maps (city-map.html, county-map.html).
// Each shape is already a link to the site's report inside an SVG <a> with a <title>.
// This swaps the slow native tooltip for a small card that shows the same text with a
// "View report" link, and stays open while the pointer moves onto it. The shapes keep
// working as plain links without it. Tab order is unchanged: the shapes stay out of it,
// and the table on the page is the keyboard route to every site.
(function () {
  // A page can include several maps; one run covers them all.
  if (window.sgMapTip) return;
  window.sgMapTip = true;
  const links = document.querySelectorAll('.sg-map a[href]');
  if (!links.length) return;

  const tip = document.createElement('div');
  tip.className = 'card card-body p-2 small shadow position-absolute d-none';
  tip.style.zIndex = '1080';
  tip.style.maxWidth = '18rem';
  tip.setAttribute('role', 'tooltip');
  const text = document.createElement('div');
  const report = document.createElement('a');
  report.textContent = 'View report';
  tip.append(text, report);
  document.body.appendChild(tip);

  let hideTimer;
  function hide() { tip.classList.add('d-none'); }
  function later() { window.clearTimeout(hideTimer); hideTimer = window.setTimeout(hide, 200); }
  function keep() { window.clearTimeout(hideTimer); }

  function show(link) {
    keep();
    text.textContent = link.getAttribute('aria-label') || '';
    report.href = link.getAttribute('href');
    tip.classList.remove('d-none');
    const box = link.getBoundingClientRect();
    const left = box.left + window.scrollX + box.width / 2 - tip.offsetWidth / 2;
    const maxLeft = document.documentElement.clientWidth - tip.offsetWidth - 8;
    tip.style.left = Math.max(8, Math.min(left, maxLeft)) + 'px';
    tip.style.top = (box.bottom + window.scrollY + 6) + 'px';
  }

  links.forEach(function (link) {
    const title = link.querySelector('title');
    if (title) {
      link.setAttribute('aria-label', title.textContent);
      title.remove();
    }
    link.addEventListener('mouseenter', function () { show(link); });
    link.addEventListener('mouseleave', later);
    link.addEventListener('focus', function () { show(link); });
    link.addEventListener('blur', later);
  });
  tip.addEventListener('mouseenter', keep);
  tip.addEventListener('mouseleave', later);
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') hide(); });
})();
