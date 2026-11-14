/* Pages CMS integration. Source HTML remains intact as a fallback. */
(() => {
  'use strict';
  const page = document.body.dataset.page || '';
  const it = ['Italiano', 'Ricerca', 'Insegnamenti'].includes(page);
  const lang = it ? 'it' : 'en';
  const q = (selector, root=document) => root.querySelector(selector);

  function safeMarkup(value) {
    const template = document.createElement('template');
    template.innerHTML = typeof value === 'string' ? value : '';
    template.content.querySelectorAll('script, iframe, object, embed, form, base, style, link, meta').forEach(n => n.remove());
    template.content.querySelectorAll('*').forEach(element => {
      for (const attr of [...element.attributes]) {
        const key = attr.name.toLowerCase();
        const val = (attr.value || '').trim();
        if (key.startsWith('on') || key === 'srcdoc' ||
            ((key === 'href' || key === 'src') && /^(?:javascript|data):/i.test(val))) {
          element.removeAttribute(attr.name);
        }
      }
      if (element.tagName === 'A' && element.target === '_blank') {
        element.rel = 'noopener noreferrer';
      }
    });
    return template.content;
  }
  function setMarkup(node, value) {
    if (!node || typeof value !== 'string') return;
    node.replaceChildren(safeMarkup(value).cloneNode(true));
  }
  function richBlock(markup) {
    const node = document.createElement('div');
    node.className = 'content-block';
    setMarkup(node, markup);
    return node;
  }
  function textBlock(label) {
    const node = document.createElement('div');
    node.className = 'content-block';
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = label;
    p.appendChild(strong);
    node.appendChild(p);
    return node;
  }
  function get(path) {
    return fetch(path + '?cms=' + Date.now(), {cache: 'no-store'})
      .then(response => {
        if (!response.ok) throw new Error('Content not available: ' + path);
        return response.json();
      });
  }
  function renderHome(home, recent) {
    if (!home || !recent || !Array.isArray(recent.publications)) return;
    const locale = it ? home.italiano : home.english;
    if (!locale || typeof locale.biography !== 'string' || typeof locale.contacts !== 'string') return;
    const biography = q('main > .home-bio');
    const contacts = q('main > .home-contact-column > .content-block:first-child');
    const publications = q('main > .home-publications-list');
    if (!biography || !contacts || !publications) return;

    setMarkup(biography, locale.biography);
    setMarkup(contacts, locale.contacts);
    const portrait = q('main > .home-portrait img');
    const sunset = q('main > .home-sunset img');
    if (portrait && typeof home.portrait_image === 'string' && home.portrait_image) portrait.src = home.portrait_image;
    if (sunset && typeof home.sunset_image === 'string' && home.sunset_image) sunset.src = home.sunset_image;

    const heading = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = it ? 'Pubblicazioni più recenti:' : 'Last publications:';
    heading.appendChild(strong);
    publications.replaceChildren(heading);
    for (const publication of recent.publications) {
      const citation = publication['citation_' + lang];
      if (typeof citation !== 'string' || !citation.trim()) continue;
      const wrapper = document.createElement('div');
      setMarkup(wrapper, citation);
      const ps = [...wrapper.querySelectorAll(':scope > p')];
      if (ps.length) {
        for (const p of ps) {
          p.dataset.publicationKind = publication.kind === 'book' ? 'book' : 'paper';
          publications.appendChild(p);
        }
      } else {
        const p = document.createElement('p');
        p.dataset.publicationKind = publication.kind === 'book' ? 'book' : 'paper';
        p.append(...wrapper.childNodes);
        publications.appendChild(p);
      }
    }
  }
  function renderTeaching(teaching, supervised) {
    if (!teaching || !supervised || !Array.isArray(teaching.courses) || !Array.isArray(supervised.students)) return;
    const main = q('main');
    if (!main) return;
    const blocks = [...main.querySelectorAll(':scope > .content-block')];
    const index = blocks.findIndex(block => /^(Student supervision|Supervisione degli studenti)$/i.test((block.textContent || '').trim()));
    if (index < 0 || !blocks[index+1]) return;
    const marker = blocks[index], supervision = blocks[index+1];
    const fragment = document.createDocumentFragment();
    for (const course of teaching.courses) {
      const title = course['title_' + lang], description = course['description_' + lang];
      if (typeof title !== 'string' || typeof description !== 'string' || !title.trim()) continue;
      const titleBlock = document.createElement('div');
      titleBlock.className = 'content-block';
      const h2 = document.createElement('h2');
      h2.textContent = title;
      titleBlock.appendChild(h2);
      fragment.appendChild(titleBlock);
      fragment.appendChild(richBlock(description));
    }
    for (const block of blocks.slice(0,index)) block.remove();
    main.insertBefore(fragment, marker);

    supervision.replaceChildren();
    for (const student of supervised.students) {
      if (!student || !student.name) continue;
      const paragraph = document.createElement('p');
      const name = document.createElement('strong');
      const period = student['period_' + lang] || '';
      name.textContent = (period ? period + '. ' : '') + student.name;
      paragraph.appendChild(name);
      paragraph.appendChild(safeMarkup(student['description_' + lang] || '').cloneNode(true));
      supervision.appendChild(paragraph);
    }
  }
  function renderResearch(research) {
    if (!research || !Array.isArray(research.publications)) return;
    const main = q('main');
    if (!main || !q(':scope > .page-title',main)) return;
    const fragment = document.createDocumentFragment();
    const types = [
      ['articles', it ? 'Articoli scientifici' : 'Research articles'],
      ['phd', it ? 'Tesi di dottorato' : 'PhD Thesis'],
      ['books', it ? 'Libri e capitoli in opere collettanee' : 'Books and book chapters']
    ];
    for (const [category, sectionTitle] of types) {
      const items = research.publications.filter(item => item.section === category);
      if (!items.length) continue;
      fragment.appendChild(textBlock(sectionTitle));
      for (const entry of items) {
        const cite = entry['citation_' + lang];
        const abstract = entry['abstract_' + lang];
        if (typeof cite !== 'string' || !cite.trim()) continue;
        fragment.appendChild(richBlock(cite));
        if (typeof abstract === 'string' && abstract.trim()) fragment.appendChild(richBlock(abstract));
      }
    }
    const note = research['notes_' + lang], works = research['works_' + lang];
    if (typeof note === 'string' && note.trim()) fragment.appendChild(richBlock(note));
    if (typeof works === 'string' && works.trim()) fragment.appendChild(richBlock(works));
    // theme.js may already have wrapped existing articles in book-entry elements.
    // Replace both forms only after all editable data has been loaded.
    for (const node of [...main.children]) {
      if (node.classList.contains('content-block') || node.classList.contains('book-entry')) node.remove();
    }
    main.appendChild(fragment);
  }

  async function load() {
    try {
      if (page === 'English' || page === 'Italiano') {
        const [home, recent] = await Promise.all([get('cms/home.json'), get('cms/publications.json')]);
        renderHome(home, recent);
      } else if (page === 'Teaching' || page === 'Insegnamenti') {
        const [teaching, students] = await Promise.all([get('cms/teaching.json'), get('cms/students.json')]);
        renderTeaching(teaching, students);
      } else if (page === 'Research' || page === 'Ricerca') {
        const research = await get('cms/research.json');
        renderResearch(research);
      }
    } catch (error) {
      // Keep the existing HTML as the visible fallback when CMS data is unavailable.
      console.warn('CMS content fallback:', error);
    }
  }
  window.__cmsReady = load();
})();
