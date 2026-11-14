/* The abbey mode is an optional layer. Original page HTML is never edited or removed. */
(() => {
  'use strict';
  const init=()=>{
  const page = document.body.dataset.page || '';
  const isIt = ['CV_1','Ricerca','Insegnamenti'].includes(page);
  const area = ['CV','CV_1'].includes(page) ? 'cv' :
    ['Teaching','Insegnamenti'].includes(page) ? 'teaching' :
    ['Research','Ricerca'].includes(page) ? 'research' : '';
  if (!area) return;

  const main = document.querySelector('main');
  if (!main) return;
  const original = Array.from(main.children).filter(node =>
    node.classList.contains('content-block') || node.classList.contains('book-entry'));
  if (!original.length) return;

  const shelf = document.createElement('div');
  shelf.className = 'abbey-shelf';
  shelf.setAttribute('aria-label', isIt ? 'Catalogo della biblioteca' : 'Library catalogue');
  const items = [];
  let section = '';

  function plain(node) {
    return (node?.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function heading(name) {
    const h = document.createElement('h2');
    h.className = 'abbey-shelf-heading';
    h.textContent = name;
    shelf.appendChild(h);
  }
  function note(nodes) {
    const wrap = document.createElement('div');
    wrap.className = 'abbey-shelf-note';
    nodes.forEach(n => wrap.appendChild(n.cloneNode(true)));
    shelf.appendChild(wrap);
  }
  function bookName(src) {
    const bolds = Array.from(src.querySelectorAll('span[style*="font-weight: 700"], strong, b'))
      .map(plain).filter(x => x.length > 12 && !/^(abstract|sommario)/i.test(x));
    if (bolds.length) return bolds.sort((a,b) => b.length - a.length)[0];
    return plain(src).replace(/https?:\/\/\S+/g, '').slice(0, 250);
  }
  function makeBook(title, contentNodes, subtitle, kind = 'book') {
    // The entire catalogue tile is a real button, including its title and icon.
    // This also enables Enter/Space activation without nested interactive controls.
    const entry = document.createElement('button');
    entry.type = 'button';
    entry.className = 'abbey-volume-row' + (kind === 'paper' ? ' abbey-paper-row' : '');
    entry.setAttribute('aria-haspopup', 'dialog');
    entry.setAttribute('aria-label', (isIt
      ? (kind === 'paper' ? 'Srotola la pergamena: ' : 'Apri il volume: ')
      : (kind === 'paper' ? 'Unroll paper: ' : 'Open volume: ')) + title);

    const icon = document.createElement('span');
    icon.className = 'abbey-volume-button';
    icon.setAttribute('aria-hidden', 'true');
    const cover = document.createElement('span');
    cover.className = kind === 'paper' ? 'abbey-scroll-cover' : 'abbey-book-cover';
    cover.setAttribute('aria-hidden', 'true');
    if (kind === 'paper') {
      const sheet = document.createElement('span');
      sheet.className = 'abbey-scroll-sheet';
      cover.appendChild(sheet);
    } else {
      cover.appendChild(document.createElement('span'));
    }
    icon.appendChild(cover);

    const label = document.createElement('span');
    label.className = 'abbey-book-label';
    const titleNode = document.createElement('span');
    titleNode.className = 'abbey-book-title';
    titleNode.textContent = title;
    label.appendChild(titleNode);
    if (subtitle) {
      const sub = document.createElement('span');
      sub.className = 'abbey-book-subtitle';
      sub.textContent = subtitle;
      label.appendChild(sub);
    }
    entry.appendChild(icon);
    entry.appendChild(label);
    shelf.appendChild(entry);
    const item = {title, contentNodes, button: entry, kind};
    items.push(item);
    entry.addEventListener('click', () => begin(item));
  }

  if (area === 'cv') {
    heading(isIt ? 'Curriculum vitae' : 'Curriculum vitae');
    makeBook('Curriculum vitae', original, isIt ? 'Formazione, incarichi, attività e riconoscimenti' : 'Education, appointments, activities and awards');
  } else if (area === 'teaching') {
    heading(isIt ? 'Insegnamenti e supervisione' : 'Courses and supervision');
    for (let i=0; i<original.length; i+=2) {
      const title = plain(original[i].querySelector('h2, h3') || original[i]);
      if (!title) continue;
      const content = original.slice(i, i+2);
      // Surface supervised students directly on the shelf, not only inside the book.
      // Both language versions use the same rule and retain the full original content.
      let subtitle = '';
      if (/^(Student supervision|Supervisione degli studenti)$/i.test(title)) {
        const students = plain(content[1] || content[0]);
        const emma = students.includes('Emma Greeff');
        const sarah = students.includes('Sarah Pinel');
        const visible = [];
        if (emma) visible.push(isIt ? 'Emma Greeff (da gennaio 2026, EPOG-JM, Torino)' : 'Emma Greeff (since January 2026, EPOG-JM, Turin)');
        if (sarah) visible.push('Sarah Pinel (2023–2024)');
        subtitle = visible.join(' · ');
      }
      makeBook(title, content, subtitle);
    }
  } else if (area === 'research') {
    for (let i=0; i<original.length; i++) {
      const row = original[i];
      if (row.classList.contains('book-entry')) {
        const headingNode = row.querySelector('.book-header .content-block') || row;
        const title = bookName(headingNode);
        const pieces = [headingNode];
        const abstract = row.querySelector('.book-abstract .content-block');
        if (abstract) pieces.push(abstract);
        makeBook(title, pieces, '', /^(Research articles|Articoli scientifici)$/i.test(section) ? 'paper' : 'book');
        continue;
      }
      const value = plain(row);
      const next = original[i+1];
      const hasAbstract = next && /^(?:Abstract|Sommario)\s*:/i.test(plain(next));
      if (hasAbstract) {
        makeBook(bookName(row), [row, next], '', /^(Research articles|Articoli scientifici)$/i.test(section) ? 'paper' : 'book');
        i++;
        continue;
      }
      if (value.length < 85 && !row.querySelector('a')) {
        section = value;
        heading(section);
      } else if (value) {
        note([row]);
      }
    }
  }
  if (!items.length) return;
  main.insertBefore(shelf, original[0]);

  const actor = document.createElement('div');
  actor.className = 'abbey-actor';
  actor.setAttribute('aria-hidden', 'true');
  const image = 'assets/' + (area === 'cv' ? 'adso' : area === 'teaching' ? 'jorge' : 'guglielmo') + '-cinematic.webp';
  actor.innerHTML = '<img class="abbey-actor-cinematic" src="' + image + '" alt="" draggable="false">';
  document.body.appendChild(actor);
  const westernImage='assets/' + (area==='cv'?'western-tuco':area==='teaching'?'western-sentenza':'western-biondo') + '-cutout.webp';
  function syncCharacter(){const character=actor.querySelector('.abbey-actor-cinematic');if(character)character.src=document.body.classList.contains('west-on')?westernImage:image;}
  document.addEventListener('site-theme-change',syncCharacter);
  syncCharacter();

  const layer = document.createElement('div');
  layer.className = 'abbey-reading-layer';
  layer.setAttribute('role','dialog');
  layer.setAttribute('aria-modal','true');
  layer.setAttribute('aria-label',isIt ? 'Libro aperto' : 'Open book');
  layer.setAttribute('tabindex','-1');
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML =
    '<div class="abbey-book-stage"><button class="abbey-book-close" type="button" aria-label="' +
    (isIt ? 'Chiudi il libro' : 'Close the book') +
    '">×</button><div class="abbey-book-spread">' +
    '<div class="abbey-page abbey-first-page"><div class="abbey-ornament">❦</div><div class="abbey-cover-title"></div>' +
    '<div class="abbey-ornament abbey-bottom-ornament">✣</div></div>' +
    '<div class="abbey-page abbey-second-page"><div class="abbey-page-contents"></div></div>' +
    '</div></div>';
  document.body.appendChild(layer);
  const stage=layer.querySelector('.abbey-book-stage');
  const content=layer.querySelector('.abbey-page-contents');
  const coverTitle=layer.querySelector('.abbey-cover-title');
  const closeButton=layer.querySelector('.abbey-book-close');
  let busy=false, opener=null, cleanupFlying=null;

  function delay(ms) {return new Promise(resolve=>setTimeout(resolve,ms));}
  function reduceMotion() {return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}
  function characterPos() {
    const a=actor.getBoundingClientRect();
    return {x:a.left+a.width*.5, y:a.top+a.height*.75};
  }
  function bookPos(button) {
    const r=button.getBoundingClientRect();
    return {x:r.left+r.width*.5,y:r.top+r.height*.55};
  }
  async function bringBook(button) {
    if (reduceMotion()) return;
    const start=characterPos(), target=bookPos(button);
    const dx=target.x-start.x, dy=target.y-start.y;
    actor.classList.add('abbey-walking');
    try {
      const walk=actor.animate([
        {transform:'translate(0px,0px) scale(1)',opacity:.95,offset:0},
        {transform:'translate('+ (dx*.65) +'px,'+ (dy*.65) +'px) scale(.98)',opacity:1,offset:.7},
        {transform:'translate('+dx+'px,'+dy+'px) scale(.9)',opacity:1,offset:1}
      ],{duration:1000,easing:'ease-in-out',fill:'forwards'});
      await walk.finished;
      actor.classList.remove('abbey-walking');
      actor.classList.add('abbey-reaching','abbey-holding');
      button.classList.add('abbey-picked');
      await delay(290);
    } catch (err) {}
  }
  async function flyToReadingDesk(button, isPaper = false) {
    if (reduceMotion()) return;
    const rect=button.getBoundingClientRect();
    const flying=document.createElement('div');
    flying.className='abbey-flying-book';
    flying.innerHTML=isPaper
      ? '<span class="abbey-scroll-cover" aria-hidden="true"><span class="abbey-scroll-sheet"></span></span>'
      : '<span class="abbey-book-cover" aria-hidden="true"><span></span></span>';
    flying.style.left=rect.left+'px';
    flying.style.top=rect.top+'px';
    document.body.appendChild(flying);
    cleanupFlying=()=>flying.remove();
    try{
      const fx=innerWidth*.5-rect.left-rect.width*.5;
      const fy=innerHeight*.48-rect.top-rect.height*.5;
      await flying.animate([
        {transform:'translate(0,0) scale(1) rotate(-5deg)',opacity:1},
        {transform:'translate('+fx*.45+'px,'+fy*.7+'px) scale(1.5) rotate(-10deg)',opacity:1,offset:.48},
        {transform:'translate('+fx+'px,'+fy+'px) scale(2.35) rotateY(-30deg)',opacity:0}
      ],{duration:640,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'}).finished;
    }catch(err){}
    cleanupFlying();cleanupFlying=null;
  }
  async function begin(item) {
    if(busy || layer.classList.contains('abbey-visible'))return;
    busy=true;opener=item.button;
    const isPaper = item.kind === 'paper';
    layer.classList.toggle('abbey-scroll-reading', isPaper);
    layer.setAttribute('aria-label', isIt ? (isPaper ? 'Pergamena aperta' : 'Libro aperto') : (isPaper ? 'Unrolled paper' : 'Open book'));
    coverTitle.textContent=item.title;
    content.replaceChildren();
    item.contentNodes.forEach(node=> {
      const copy=node.cloneNode(true);
      copy.classList.remove('book-entry');
      content.appendChild(copy);
    });
    try{
      if(document.body.classList.contains('rose-on')){
        await bringBook(item.button);await flyToReadingDesk(item.button, isPaper);
      }else{
        item.button.classList.add('abbey-picked');
        if(!reduceMotion())await delay(170);
      }
    }catch(err){}
    layer.classList.add('abbey-visible');
    layer.setAttribute('aria-hidden','false');
    document.body.classList.add('abbey-modal-open');
    requestAnimationFrame(()=>{layer.classList.add('abbey-book-opened');closeButton.focus({preventScroll:true});});
    busy=false;
  }
  function closeBook(){
    if(!layer.classList.contains('abbey-visible'))return;
    layer.classList.remove('abbey-book-opened','abbey-visible','abbey-scroll-reading');
    layer.setAttribute('aria-hidden','true');
    document.body.classList.remove('abbey-modal-open');
    actor.classList.remove('abbey-walking','abbey-reaching','abbey-holding');
    actor.getAnimations().forEach(animation=>animation.cancel());
    items.forEach(x=>x.button.classList.remove('abbey-picked'));
    if(cleanupFlying){cleanupFlying();cleanupFlying=null}
    opener?.focus({preventScroll:true});
    opener=null;
  }
  closeButton.addEventListener('click',closeBook);
  layer.addEventListener('click',event=>{if(event.target===layer)closeBook();});
  document.addEventListener('keydown',event=>{
    if(!layer.classList.contains('abbey-visible'))return;
    if(event.key==='Escape'){event.preventDefault();closeBook();}
    if(event.key==='Tab'){
      const focusable=Array.from(layer.querySelectorAll('a[href], button:not([disabled])'));
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  const themeButton=document.getElementById('rose-toggle');
  themeButton?.addEventListener('click',()=>{if(!document.body.classList.contains('rose-on'))closeBook();});
};const ready=window.__cmsReady;if(ready&&typeof ready.then==='function')ready.then(init,init);else init();})();