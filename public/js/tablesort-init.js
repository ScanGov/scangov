document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('table[data-sortable]').forEach(t => new Tablesort(t));
});
