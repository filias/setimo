/* Utilitários partilhados: tema, carregamento de dados e criação de elementos. */

/** Escapa texto para inserção segura em HTML. */
function esc(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Cria um elemento com classe, texto e/ou HTML interno. */
function el(tag, props = {}, filhos = []) {
  const n = document.createElement(tag);
  for (const [chave, valor] of Object.entries(props)) {
    if (valor === undefined || valor === null) continue;
    if (chave === 'class') n.className = valor;
    else if (chave === 'texto') n.textContent = valor;
    else if (chave === 'html') n.innerHTML = valor;
    else if (chave.startsWith('data-') || chave === 'style') n.setAttribute(chave, valor);
    else n.setAttribute(chave, valor);
  }
  for (const f of [].concat(filhos)) {
    if (f) n.appendChild(typeof f === 'string' ? document.createTextNode(f) : f);
  }
  return n;
}

/** Carrega um JSON da pasta /dados. */
async function carregarDados(ficheiro) {
  const resposta = await fetch(`dados/${ficheiro}.json`, { cache: 'no-cache' });
  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar dados/${ficheiro}.json (HTTP ${resposta.status})`);
  }
  return resposta.json();
}

/** Mostra uma mensagem de erro legível no contentor indicado. */
function mostrarErro(contentor, erro) {
  contentor.innerHTML = '';
  contentor.appendChild(el('div', { class: 'estado erro' }, [
    el('p', { texto: erro.message }),
    el('p', {
      class: 'estado',
      html: 'Se abriste o ficheiro com duplo clique, o navegador bloqueia a leitura dos dados. ' +
            'Arranca o servidor local: <code>python3 servidor.py</code>'
    })
  ]));
}

/* ------------------------------------------------------------------ tema -- */

(function iniciarTema() {
  const guardado = localStorage.getItem('setimo-tema');
  if (guardado) document.documentElement.setAttribute('data-tema', guardado);

  document.addEventListener('click', (evento) => {
    if (!evento.target.closest('#alterna-tema')) return;
    const raiz = document.documentElement;
    const escuroAgora = raiz.getAttribute('data-tema') === 'escuro' ||
      (!raiz.getAttribute('data-tema') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const novo = escuroAgora ? 'claro' : 'escuro';
    raiz.setAttribute('data-tema', novo);
    localStorage.setItem('setimo-tema', novo);
  });
})();
