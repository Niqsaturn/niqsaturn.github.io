(() => {
 'use strict';
 const query=new URLSearchParams(location.search);
 function legacy(){const script=document.createElement('script');script.src='/forum/compose.js?v=20261127-1';document.head.append(script);}
 if(query.get('legacy')==='1'||!window.EnRouteProtected){legacy();return;}
 const main=document.querySelector('#compose'),login=document.querySelector('#login-section'),editor=document.querySelector('#editor-section');if(!main||!login||!editor){legacy();return;}
 login.hidden=true;editor.hidden=true;
 const lead=main.querySelector('.compose-lead');if(lead)lead.textContent='Sign in once with your En-Route game account to publish discussions, replies, and private reports.';
 const card=document.createElement('section');card.className='compose-card protected-forum-card';
 const fragment=new URLSearchParams();
 for(const k of ['topic','report','reply']){const v=query.get(k);if(/^[1-9]\d{0,7}$/.test(v||''))fragment.set(k,v);}
 const c=query.get('category');if(/^[a-z0-9_-]{1,32}$/.test(c||''))fragment.set('category',c);
 const alternate=document.createElement('a');const target=new URL(location.href);target.searchParams.set('legacy','1');alternate.href=target.pathname+target.search;alternate.className='compose-link';alternate.textContent='Use alternate posting form';
 const note=document.createElement('p');note.className='compose-note';note.textContent='Keep passwords, verification codes, private logs and account information out of your posts.';
 login.before(card);window.EnRouteProtected.mount(card,{mode:'forum',fragment:fragment.toString(),onPublished:id=>location.assign('/forum/?topic='+encodeURIComponent(id))});card.append(note,alternate);
})();