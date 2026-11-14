/* Bilingual home-page publication links: books remain volumes, journal papers become scrolls. */
(() => {
  'use strict';
  const init = () => {
    const page = document.body.dataset.page;
    if (page !== 'English' && page !== 'Italiano') return;
    const it = page === 'Italiano';
    const main = document.querySelector('main');
    if (!main) return;
    const section = [...main.querySelectorAll(':scope > .content-block')]
      .find(block => /^(?:Last publications|Pubblicazioni più recenti)\s*:/i.test((block.querySelector('p')?.textContent || '').trim()));
    if (!section) return;
    section.classList.add('home-publications');

    let count = 0;
    for (const p of [...section.querySelectorAll(':scope > p')].slice(1)) {
      const existing = [...p.querySelectorAll('a[href]')].find(link => /^https?:\/\/(?:dx\.)?doi\.org\//i.test(link.href));
      let href = existing?.href || '';
      if (!href) {
        const found = (p.textContent || '').match(/https?:\/\/(?:dx\.)?doi\.org\/[^\s<>]+/i);
        if (found) href = found[0].replace(/[.,;()]+$/, '');
      }
      if (!href || p.querySelector('.home-pub-book')) continue;

      const text = p.textContent || '';
      const inferredBook = /Cambridge University Press|Elements in Evolutionary Economics|monograph|monografia/i.test(text) || /10\.1017\/978/i.test(href);
      const kind = p.dataset.publicationKind === 'paper' || p.dataset.publicationKind === 'book'
        ? p.dataset.publicationKind
        : inferredBook ? 'book' : 'paper';

      const a = document.createElement('a');
      a.className = 'home-pub-book';
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = it ? 'Apri la pubblicazione' : 'Open publication';
      a.setAttribute('aria-label', a.title + ': ' + text.trim().slice(0, 120));
      if (kind === 'paper') {
        const scroll = document.createElement('span');
        scroll.className = 'home-scroll-icon';
        scroll.setAttribute('aria-hidden', 'true');
        scroll.appendChild(document.createElement('i'));
        a.appendChild(scroll);
        p.classList.add('home-paper-row');
      } else {
        a.innerHTML = '<span class="home-book-icon" aria-hidden="true"><i></i><i></i><i></i></span>';
        p.classList.add('home-book-row');
      }
      p.insertBefore(a, p.firstChild);
      p.classList.add('home-publication-row');
      p.addEventListener('pointerdown', () => {
        if (kind !== 'paper') return;
        p.classList.add('home-unrolling');
        window.setTimeout(() => p.classList.remove('home-unrolling'), 850);
      });
      count++;
    }
    section.dataset.bookCount = String(count);
  };
  const ready = window.__cmsReady;
  if (ready && typeof ready.then === 'function') ready.then(init, init);
  else init();
})();
