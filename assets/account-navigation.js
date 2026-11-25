(() => {
 'use strict';
 const KEY='enroute-ad-free-receipt-v1',NAME='enroute-account-display-v1';
 const signin=location.pathname.startsWith('/forum/')?'/account/ad-free.html?return=%2Fforum%2F':'/account/ad-free.html';
 function render(){
  const nav=document.querySelector('.header nav');if(!nav||new URLSearchParams(location.search).get('signin')==='1')return;
  nav.querySelector('[data-enroute-account-nav]')?.remove();
  let name=null,receipt=null;
  try{name=localStorage.getItem(NAME);receipt=localStorage.getItem(KEY);}catch{}
  const account=document.createElement('span');account.dataset.enrouteAccountNav='';
  if(name&&receipt&&/^[A-Za-z0-9_.-]{3,24}$/.test(name)){
   const menu=document.createElement('details');menu.className='enroute-account-menu';
   const label=document.createElement('summary');label.textContent=name;label.setAttribute('aria-label','Account menu for '+name);
   const actions=document.createElement('div');actions.className='enroute-account-actions';
   const profile=document.createElement('a');profile.href=signin;profile.textContent='Account';profile.title='Sign in to access protected account functions';
   const exit=document.createElement('button');exit.type='button';exit.textContent='Sign out';
   exit.addEventListener('click',()=>{try{localStorage.removeItem(NAME);localStorage.removeItem(KEY);}catch{}location.assign(location.pathname.startsWith('/forum/')?'/forum/':'/');});
   actions.append(profile,exit);menu.append(label,actions);account.append(menu);
  }else{
   const link=document.createElement('a');link.href=signin;link.textContent='Sign in';account.append(link);
  }
  nav.append(account);
 }
 window.addEventListener('storage',e=>{if(e.key===KEY||e.key===NAME||e.key===null)render();});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();