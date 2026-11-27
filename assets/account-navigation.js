(() => {
 'use strict';
 const KEY='enroute-ad-free-receipt-v1',NAME='enroute-account-display-v1',UNTIL='enroute-web-session-until-v1';
 const signin=location.pathname.startsWith('/forum/')?'/?signin=1&return=%2Fforum%2F':'/?signin=1';
 function render(){
  const nav=document.querySelector('[data-account-controls]')||document.querySelector('.header nav');if(!nav||new URLSearchParams(location.search).get('signin')==='1')return;
  nav.querySelector('[data-enroute-account-nav]')?.remove();
  let name=null,receipt=null,until=null;
  try{name=localStorage.getItem(NAME);receipt=localStorage.getItem(KEY);until=localStorage.getItem(UNTIL);if(until&&Number(until)<=Date.now()){localStorage.removeItem(NAME);localStorage.removeItem(UNTIL);name=null;until=null;}}catch{}
  const account=document.createElement('span');account.dataset.enrouteAccountNav='';
  if(name&&(Number(until)>Date.now()||/^v2\.[A-Za-z0-9_-]{70}$/.test(receipt||''))&&/^[A-Za-z0-9_.-]{3,24}$/.test(name)){
   const menu=document.createElement('details');menu.className='enroute-account-menu';
   const label=document.createElement('summary');label.textContent=name;label.setAttribute('aria-label','Account menu for '+name);label.title=Number(until)>Date.now()?'Account menu':'Remembered account; protected actions may require sign-in';
   const actions=document.createElement('div');actions.className='enroute-account-actions';
   const profile=document.createElement('a');profile.href=signin;profile.textContent='Account';profile.title='Manage your account';
   const exit=document.createElement('button');exit.type='button';exit.textContent='Sign out';
   exit.addEventListener('click',()=>{if(Number(until)>Date.now()){location.assign(signin+'&logout=1');return;}try{localStorage.removeItem(NAME);localStorage.removeItem(KEY);localStorage.removeItem(UNTIL);}catch{}location.assign(location.pathname.startsWith('/forum/')?'/forum/':'/');});
   actions.append(profile,exit);menu.append(label,actions);account.append(menu);
  }else{
   const link=document.createElement('a');link.href=signin;link.textContent='Sign in';if(nav.hasAttribute('data-account-controls')){link.setAttribute('aria-expanded','false');}account.append(link);
  }
  nav.append(account);
 }
 window.addEventListener('enroute-account-display-changed',render);
 window.addEventListener('focus',render);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
 window.addEventListener('storage',e=>{if(e.key===KEY||e.key===NAME||e.key===UNTIL||e.key===null)render();});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();