/* Página inicial: grelha das disciplinas do 7.º ano. */

(async function () {
  const grelha = document.getElementById('grelha-disciplinas');

  let dados;
  try {
    dados = await carregarDados('disciplinas');
  } catch (erro) {
    mostrarErro(grelha, erro);
    return;
  }

  const prontas = dados.disciplinas.filter(d => d.estado === 'pronto');
  document.getElementById('contagem').textContent =
    `${prontas.length} de ${dados.disciplinas.length} com currículo e atividades`;
  document.getElementById('nota-matriz').textContent = dados.notaMatriz;

  grelha.innerHTML = '';

  for (const disc of dados.disciplinas) {
    const pronta = disc.estado === 'pronto';
    const cartao = el(pronta ? 'a' : 'div', {
      class: `cartao${pronta ? '' : ' inativo'}`,
      href: pronta ? `disciplina.html?d=${encodeURIComponent(disc.id)}` : null
    }, [
      el('span', { class: 'selo ' + disc.estado, texto: pronta ? 'Pronto' : 'Em breve' }),
      el('span', { class: 'emoji', texto: disc.emoji, 'aria-hidden': 'true' }),
      el('span', { class: 'area', texto: disc.area }),
      el('h3', { texto: disc.nome }),
      el('p', { texto: disc.resumo })
    ]);
    grelha.appendChild(cartao);
  }
})();
