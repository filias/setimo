/* Home page: the grid of 7th-grade subjects. */

(async function () {
  const grid = document.getElementById('subject-grid');

  let data;
  try {
    data = await loadData('subjects');
  } catch (error) {
    showError(grid, error);
    return;
  }

  const ready = data.subjects.filter(s => s.status === 'ready');
  document.getElementById('subject-count').textContent =
    `${ready.length} de ${data.subjects.length} com currículo e atividades`;
  document.getElementById('matrix-note').textContent = data.matrixNote;

  grid.innerHTML = '';

  for (const subject of data.subjects) {
    const isReady = subject.status === 'ready';
    const card = el(isReady ? 'a' : 'div', {
      class: `card${isReady ? '' : ' disabled'}`,
      href: isReady ? `subject.html?subject=${encodeURIComponent(subject.id)}` : null
    }, [
      el('span', { class: 'badge ' + subject.status, text: isReady ? 'Pronto' : 'Em breve' }),
      el('span', { class: 'emoji', text: subject.emoji, 'aria-hidden': 'true' }),
      el('span', { class: 'area', text: subject.area }),
      el('h3', { text: subject.name }),
      el('p', { text: subject.summary })
    ]);
    grid.appendChild(card);
  }
})();
