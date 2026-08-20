/* Subject page: domains, subtopics, official essentials and activities. */

const DOMAIN_COLORS = {
  espaco: ['var(--space-color)', 'var(--space-light)'],
  materiais: ['var(--materials-color)', 'var(--materials-light)'],
  energia: ['var(--energy-color)', 'var(--energy-light)']
};

(async function () {
  const content = document.getElementById('content');
  const id = new URLSearchParams(location.search).get('subject');

  if (!id) {
    showError(content, new Error('Falta indicar a disciplina no endereço (?subject=…).'));
    return;
  }

  let subject;
  try {
    subject = await loadData(id.replace(/[^a-z0-9-]/gi, ''));
  } catch (error) {
    showError(content, error);
    return;
  }

  document.title = `${subject.name} — 7.º ano — Sétimo`;
  content.innerHTML = '';
  content.appendChild(buildHero(subject));
  for (const domain of subject.domains) {
    content.appendChild(buildDomain(domain, subject));
  }
  fillFooter(subject);
  initModes();
})();

/* ------------------------------------------------------------------ hero -- */

function buildHero(subject) {
  const links = el('div', { class: 'domain-nav' },
    subject.domains.map(domain => el('a', {
      class: 'domain-link',
      href: `#${domain.id}`,
      text: `${domain.emoji} ${domain.name}`
    }))
  );

  return el('section', { class: 'subject-hero' }, [
    el('div', { class: 'wrap' }, [
      el('p', { class: 'breadcrumb', html: `<a href="index.html">7.º ano</a> › ${esc(subject.name)}` }),
      el('h1', {}, [el('span', { text: subject.emoji, 'aria-hidden': 'true' }), subject.name]),
      el('p', { class: 'lead student', text: subject.studentIntro }),
      el('p', { class: 'lead', text: subject.intro }),
      links,
      buildSourceLink(subject)
    ])
  ]);
}

/** Link to the official DGE PDF, visible in every reading mode. */
function buildSourceLink(subject) {
  return el('p', { class: 'official-source' }, [
    el('a', {
      href: subject.source.url,
      target: '_blank',
      rel: 'noopener',
      title: subject.source.title
    }, [
      el('span', { text: '📄', 'aria-hidden': 'true' }),
      'Currículo oficial: Aprendizagens Essenciais de ' + subject.name,
      el('span', { class: 'file-type', text: 'PDF, DGE' })
    ])
  ]);
}

/* ---------------------------------------------------------------- domain -- */

function buildDomain(domain, subject) {
  const [color, colorLight] = DOMAIN_COLORS[domain.id] || ['var(--brand)', 'var(--brand-light)'];

  const section = el('section', {
    class: 'domain',
    id: domain.id,
    style: `--color:${color};--color-light:${colorLight}`
  });

  const wrap = el('div', { class: 'wrap' }, [
    el('div', { class: 'domain-header' }, [
      el('span', { class: 'emoji', text: domain.emoji, 'aria-hidden': 'true' }),
      el('h2', { text: domain.name }),
      el('p', { class: 'domain-summary', text: domain.summary })
    ])
  ]);

  for (const subtopic of domain.subtopics) {
    wrap.appendChild(buildSubtopic(subtopic, subject));
  }

  section.appendChild(wrap);
  return section;
}

/* -------------------------------------------------------------- subtopic -- */

function buildSubtopic(subtopic, subject) {
  const block = el('article', { class: 'subtopic', id: subtopic.id }, [
    el('h3', { text: subtopic.name }),
    el('p', { class: 'student', text: subtopic.student })
  ]);

  if (subtopic.questions?.length) {
    block.appendChild(el('div', { class: 'questions' }, [
      el('span', { class: 'label', text: 'Perguntas para levar contigo' }),
      el('ul', {}, subtopic.questions.map(q => el('li', { text: q })))
    ]));
  }

  block.appendChild(buildOfficialLayer(subtopic, subject));

  if (subtopic.activities?.length) {
    block.appendChild(el('h4', {
      class: 'activities-header',
      text: `${subtopic.activities.length} ${subtopic.activities.length === 1 ? 'atividade' : 'atividades'}`
    }));
    for (const activity of subtopic.activities) block.appendChild(buildActivity(activity));
  }

  return block;
}

function buildOfficialLayer(subtopic, subject) {
  const list = el('ol', {}, subtopic.essentials.map(item => el('li', { text: item })));

  return el('details', { class: 'official' }, [
    el('summary', { text: `Aprendizagens Essenciais (texto oficial) — ${subtopic.essentials.length} descritores` }),
    el('div', { class: 'content' }, [
      list,
      el('p', {
        class: 'source-note',
        html: `Transcrito de <a href="${esc(subject.source.url)}" target="_blank" rel="noopener">${esc(subject.source.title)}</a>, ${esc(subject.source.publisher)}.`
      })
    ])
  ]);
}

/* -------------------------------------------------------------- activity -- */

function buildActivity(activity) {
  const body = el('div', { class: 'activity-body' });

  if (activity.materials?.length) {
    body.appendChild(el('h5', { text: 'Material' }));
    body.appendChild(el('ul', { class: 'materials' }, activity.materials.map(m => el('li', { text: m }))));
  }

  body.appendChild(el('h5', { text: 'Como se faz' }));
  body.appendChild(el('ol', { class: 'steps' }, activity.steps.map(s => el('li', { text: s }))));

  if (activity.safety) body.appendChild(noteBox('safety', '⚠️', 'Segurança', activity.safety));
  if (activity.curriculumLink) body.appendChild(noteBox('curriculum', '🎯', 'Liga-se ao currículo', activity.curriculumLink));
  if (activity.reflection) body.appendChild(noteBox('reflection', '💭', 'Para pensar depois', activity.reflection));

  return el('details', { class: 'activity' }, [
    el('summary', {}, [
      el('span', { class: 'activity-title', text: activity.title }),
      el('span', { class: 'pill', text: activity.type }),
      el('span', { class: 'pill duration', text: activity.duration })
    ]),
    body
  ]);
}

function noteBox(kind, icon, title, text) {
  return el('div', { class: `note ${kind}` }, [
    el('span', { class: 'icon', text: icon, 'aria-hidden': 'true' }),
    el('div', {}, [
      el('strong', { text: title }),
      el('span', { text })
    ])
  ]);
}

/* ---------------------------------------------------------------- extras -- */

function fillFooter(subject) {
  document.getElementById('footer-source').innerHTML =
    `Currículo oficial: <a href="${esc(subject.source.url)}" target="_blank" rel="noopener">${esc(subject.source.title)}</a>, ` +
    `${esc(subject.source.publisher)}. ${esc(subject.source.note)} As atividades são propostas próprias, não oficiais.`;
}

/** Switches between the three reading layers: student, both, curriculum. */
function initModes() {
  const buttons = document.querySelectorAll('[data-mode-btn]');
  const saved = localStorage.getItem('setimo-mode') || 'both';

  function apply(mode) {
    document.body.dataset.mode = mode;
    localStorage.setItem('setimo-mode', mode);
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.modeBtn === mode)));
    // In curriculum mode, open every official layer up front.
    document.querySelectorAll('details.official').forEach(x => { x.open = mode === 'curriculum'; });
  }

  buttons.forEach(b => b.addEventListener('click', () => apply(b.dataset.modeBtn)));
  apply(saved);
}
