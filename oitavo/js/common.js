/* Shared helpers: theme, data loading and element creation. */

/** Escapes text for safe insertion into HTML. */
function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Creates an element with a class, text and/or inner HTML. */
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child) node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

/** Loads a JSON file from the /data folder. */
async function loadData(file) {
  const response = await fetch(`data/${file}.json`, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar data/${file}.json (HTTP ${response.status})`);
  }
  return response.json();
}

/** Shows a readable error message in the given container. */
function showError(container, error) {
  container.innerHTML = '';
  container.appendChild(el('div', { class: 'status error' }, [
    el('p', { text: error.message }),
    el('p', {
      class: 'status',
      html: 'Se abriste o ficheiro com duplo clique, o navegador bloqueia a leitura dos dados. ' +
            'Arranca o servidor local: <code>python3 server.py</code>'
    })
  ]));
}

/* ----------------------------------------------------------------- theme -- */

(function initTheme() {
  const saved = localStorage.getItem('oitavo-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  document.addEventListener('click', (event) => {
    if (!event.target.closest('#theme-toggle')) return;
    const root = document.documentElement;
    const isDarkNow = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next = isDarkNow ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('oitavo-theme', next);
  });
})();
