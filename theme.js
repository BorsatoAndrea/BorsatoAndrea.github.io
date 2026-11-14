(()=>{'use strict';
const btn=document.getElementById('rose-toggle'),guide=document.getElementById('rose-guide'),portrait=document.getElementById('rose-portrait-img');if(!btn)return;
const key=document.body.dataset.page;const characters={CV:'adso',CV_1:'adso',Research:'guglielmo',Ricerca:'guglielmo',Teaching:'jorge',Insegnamenti:'jorge'};const isItalian=['Italiano','CV_1','Ricerca','Insegnamenti','page'].includes(key);
function prepareCatalog(){if(key!=='Research'&&key!=='Ricerca')return;const main=document.querySelector('main'),blocks=[...main.querySelectorAll(':scope > .content-block')];
for(let i=1;i<blocks.length;i++){const abs=blocks[i];if(!/^(?:Abstract|Sommario)\s*:/i.test((abs.textContent||'').trim()))continue;const preceding=blocks[i-1];if(!preceding||preceding.parentElement!==main||!/(?:20\d{2}|19\d{2})/.test(preceding.textContent||''))continue;
const entry=document.createElement('section');entry.className='book-entry';const header=document.createElement('div');header.className='book-header';const body=document.createElement('div');body.className='book-abstract';body.id='book-abstract-'+i;
const trigger=document.createElement('button');trigger.type='button';trigger.className='book-trigger';trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',body.id);trigger.setAttribute('aria-label',isItalian?'Apri o chiudi abstract e collegamento':'Open or close abstract and publication link');trigger.innerHTML='<span class="book-icon" aria-hidden="true"></span>';
main.insertBefore(entry,preceding);entry.appendChild(header);header.appendChild(trigger);header.appendChild(preceding);entry.appendChild(body);body.appendChild(abs);
const ext=preceding.querySelector('a[href^="http"]');if(ext){const more=document.createElement('a');more.className='book-original-link';more.href=ext.href;more.target='_blank';more.rel='noopener noreferrer';more.textContent=isItalian?'Vai alla pubblicazione':'Open publication';body.appendChild(more)}
trigger.addEventListener('click',()=>{const next=!entry.classList.contains('is-open');entry.classList.toggle('is-open',next);trigger.setAttribute('aria-expanded',String(next))});}}
prepareCatalog();
if(guide){guide.setAttribute('aria-hidden','true');const face=document.getElementById('rose-face');if(face){face.disabled=true;face.tabIndex=-1;face.setAttribute('aria-hidden','true')}const story=characters[key];if(story){guide.classList.add('active');portrait.src='assets/'+story+'.svg';portrait.alt=''}const dialog=guide.querySelector('.rose-dialog');if(dialog)dialog.remove()}
/* Three interchangeable layouts: contemporary, abbey and Far West. */
const westBtn=document.createElement('button');westBtn.id='west-toggle';westBtn.type='button';westBtn.className='theme-toggle';westBtn.textContent=isItalian?'Modalità Western':'Go to Far West';btn.insertAdjacentElement('afterend',westBtn);
const link=document.createElement('link');link.rel='stylesheet';link.href='western-theme.css';document.head.appendChild(link);
const cineLink=document.createElement('link');cineLink.rel='stylesheet';cineLink.href='western-cinematic.css?v=20261113b';document.head.appendChild(cineLink);
const wrap=btn.closest('.theme-control');
if(wrap){
  wrap.classList.add('theme-control-stacked');
  // Keep the language choice and both theme buttons together at the far right of the navigation.
  const nav=document.querySelector('header .nav');
  if(nav){
    const italiano=nav.querySelector('a[href="Italiano.html"]');
    if(italiano)nav.appendChild(italiano);
    nav.appendChild(wrap);
  }
}
function mode(){return document.body.classList.contains('west-on')?'western':(document.body.classList.contains('rose-on')?'medieval':'modern')}
function sync(){const m=mode();btn.textContent=m==='medieval'?(isItalian?'Ritorna al presente':'Return to the present'):(isItalian?'Modalità Medioevo':'Go to Middle Age');btn.setAttribute('aria-pressed',String(m==='medieval'));westBtn.textContent=m==='western'?(isItalian?'Ritorna al presente':'Return to the present'):(isItalian?'Modalità Western':'Go to Far West');westBtn.setAttribute('aria-pressed',String(m==='western'));
 document.dispatchEvent(new CustomEvent('site-theme-change',{detail:{theme:m}}));}
function setMode(m){document.body.classList.toggle('rose-on',m!=='modern');document.body.classList.toggle('west-on',m==='western');try{localStorage.setItem('site-theme',m);localStorage.setItem('rose-abbey-theme',m==='medieval'?'on':'off')}catch(e){}sync()}
btn.addEventListener('click',()=>setMode(mode()==='medieval'?'modern':'medieval'));
westBtn.addEventListener('click',()=>setMode(mode()==='western'?'modern':'western'));
let stored='modern';try{stored=localStorage.getItem('site-theme')||(localStorage.getItem('rose-abbey-theme')==='on'?'medieval':'modern')}catch(e){}setMode(['medieval','western','modern'].includes(stored)?stored:'modern');
})();