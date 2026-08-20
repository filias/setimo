/* Página de uma disciplina: domínios, subdomínios, AE oficiais e atividades. */

const CORES_DOMINIO = {
  espaco: ['var(--espaco-cor)', 'var(--espaco-claro)'],
  materiais: ['var(--materiais-cor)', 'var(--materiais-claro)'],
  energia: ['var(--energia-cor)', 'var(--energia-claro)']
};

(async function () {
  const conteudo = document.getElementById('conteudo');
  const id = new URLSearchParams(location.search).get('d');

  if (!id) {
    mostrarErro(conteudo, new Error('Falta indicar a disciplina no endereço (?d=…).'));
    return;
  }

  let d;
  try {
    d = await carregarDados(id.replace(/[^a-z0-9-]/gi, ''));
  } catch (erro) {
    mostrarErro(conteudo, erro);
    return;
  }

  document.title = `${d.nome} — 7.º ano — Sétimo`;
  conteudo.innerHTML = '';
  conteudo.appendChild(construirHeroi(d));
  for (const dominio of d.dominios) {
    conteudo.appendChild(construirDominio(dominio, d));
  }
  preencherRodape(d);
  iniciarModos();
})();

/* ---------------------------------------------------------------- herói -- */

function construirHeroi(d) {
  const atalhos = el('div', { class: 'dominio-atalhos' },
    d.dominios.map(dom => el('a', {
      class: 'atalho',
      href: `#${dom.id}`,
      texto: `${dom.emoji} ${dom.nome}`
    }))
  );

  return el('section', { class: 'disc-heroi' }, [
    el('div', { class: 'envolve' }, [
      el('p', { class: 'migalhas', html: `<a href="index.html">7.º ano</a> › ${esc(d.nome)}` }),
      el('h1', {}, [el('span', { texto: d.emoji, 'aria-hidden': 'true' }), d.nome]),
      el('p', { class: 'lead para-ti', texto: d.paraTiIntro }),
      el('p', { class: 'lead', texto: d.intro }),
      atalhos,
      construirLigacaoFonte(d)
    ])
  ]);
}

/** Ligação ao PDF oficial da DGE, visível em qualquer modo de leitura. */
function construirLigacaoFonte(d) {
  return el('p', { class: 'fonte-oficial' }, [
    el('a', {
      href: d.fonte.url,
      target: '_blank',
      rel: 'noopener',
      title: d.fonte.titulo
    }, [
      el('span', { texto: '📄', 'aria-hidden': 'true' }),
      'Currículo oficial: Aprendizagens Essenciais de ' + d.nome,
      el('span', { class: 'tipo-ficheiro', texto: 'PDF, DGE' })
    ])
  ]);
}

/* -------------------------------------------------------------- domínio -- */

function construirDominio(dominio, d) {
  const [cor, corClara] = CORES_DOMINIO[dominio.id] || ['var(--marca)', 'var(--marca-clara)'];

  const seccao = el('section', {
    class: 'dominio',
    id: dominio.id,
    style: `--cor:${cor};--cor-clara:${corClara}`
  });

  const envolve = el('div', { class: 'envolve' }, [
    el('div', { class: 'dominio-cab' }, [
      el('span', { class: 'emoji', texto: dominio.emoji, 'aria-hidden': 'true' }),
      el('h2', { texto: dominio.nome }),
      el('p', { class: 'sumario', texto: dominio.sumario })
    ])
  ]);

  for (const sub of dominio.subdominios) {
    envolve.appendChild(construirSubdominio(sub, d));
  }

  seccao.appendChild(envolve);
  return seccao;
}

/* ----------------------------------------------------------- subdomínio -- */

function construirSubdominio(sub, d) {
  const bloco = el('article', { class: 'subdominio', id: sub.id }, [
    el('h3', { texto: sub.nome }),
    el('p', { class: 'para-ti', texto: sub.paraTi })
  ]);

  if (sub.perguntas?.length) {
    bloco.appendChild(el('div', { class: 'perguntas' }, [
      el('span', { class: 'rotulo', texto: 'Perguntas para levar contigo' }),
      el('ul', {}, sub.perguntas.map(p => el('li', { texto: p })))
    ]));
  }

  bloco.appendChild(construirCamadaOficial(sub, d));

  if (sub.atividades?.length) {
    bloco.appendChild(el('h4', {
      class: 'atividades-cab',
      texto: `${sub.atividades.length} ${sub.atividades.length === 1 ? 'atividade' : 'atividades'}`
    }));
    for (const at of sub.atividades) bloco.appendChild(construirAtividade(at));
  }

  return bloco;
}

function construirCamadaOficial(sub, d) {
  const lista = el('ol', {}, sub.ae.map(item => el('li', { texto: item })));

  return el('details', { class: 'oficial' }, [
    el('summary', { texto: `Aprendizagens Essenciais (texto oficial) — ${sub.ae.length} descritores` }),
    el('div', { class: 'conteudo' }, [
      lista,
      el('p', {
        class: 'nota-fonte',
        html: `Transcrito de <a href="${esc(d.fonte.url)}" target="_blank" rel="noopener">${esc(d.fonte.titulo)}</a>, ${esc(d.fonte.editor)}.`
      })
    ])
  ]);
}

/* ------------------------------------------------------------ atividade -- */

function construirAtividade(at) {
  const corpo = el('div', { class: 'corpo' });

  if (at.material?.length) {
    corpo.appendChild(el('h5', { texto: 'Material' }));
    corpo.appendChild(el('ul', { class: 'material' }, at.material.map(m => el('li', { texto: m }))));
  }

  corpo.appendChild(el('h5', { texto: 'Como se faz' }));
  corpo.appendChild(el('ol', { class: 'passos' }, at.passos.map(p => el('li', { texto: p }))));

  if (at.cuidado) corpo.appendChild(caixa('cuidado', '⚠️', 'Segurança', at.cuidado));
  if (at.ligacao) corpo.appendChild(caixa('ligacao', '🎯', 'Liga-se ao currículo', at.ligacao));
  if (at.reflexao) corpo.appendChild(caixa('reflexao', '💭', 'Para pensar depois', at.reflexao));

  return el('details', { class: 'atividade' }, [
    el('summary', {}, [
      el('span', { class: 'titulo', texto: at.titulo }),
      el('span', { class: 'pilula', texto: at.tipo }),
      el('span', { class: 'pilula tempo', texto: at.duracao })
    ]),
    corpo
  ]);
}

function caixa(tipo, icone, titulo, texto) {
  return el('div', { class: `caixa ${tipo}` }, [
    el('span', { class: 'icone', texto: icone, 'aria-hidden': 'true' }),
    el('div', {}, [
      el('strong', { texto: titulo }),
      el('span', { texto })
    ])
  ]);
}

/* ---------------------------------------------------------------- extras -- */

function preencherRodape(d) {
  document.getElementById('rodape-fonte').innerHTML =
    `Currículo oficial: <a href="${esc(d.fonte.url)}" target="_blank" rel="noopener">${esc(d.fonte.titulo)}</a>, ` +
    `${esc(d.fonte.editor)}. ${esc(d.fonte.nota)} As atividades são propostas próprias, não oficiais.`;
}

/** Alterna entre as três camadas de leitura: aluno, ambos, currículo. */
function iniciarModos() {
  const botoes = document.querySelectorAll('[data-modo-btn]');
  const guardado = localStorage.getItem('setimo-modo') || 'ambos';

  function aplicar(modo) {
    document.body.dataset.modo = modo;
    localStorage.setItem('setimo-modo', modo);
    botoes.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.modoBtn === modo)));
    // No modo currículo, abre já todas as camadas oficiais.
    document.querySelectorAll('details.oficial').forEach(x => { x.open = modo === 'curriculo'; });
  }

  botoes.forEach(b => b.addEventListener('click', () => aplicar(b.dataset.modoBtn)));
  aplicar(guardado);
}
