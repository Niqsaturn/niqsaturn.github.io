(() => {
 'use strict';
 const KEY='enroute-ad-free-receipt-v1',NAME='enroute-account-display-v1';
 const signin='/'+(location.pathname.startsWith('/forum/')?'?signin=1&return=%2Fforum%2F':'?signin=1');
 function render(){
  const nav=document.querySelector('.header nav');if(!nav||new URLSearchParams(location.search).get('signin')==='1')return;
  let old=nav.querySelector('[data-enroute-account-nav]');old?.remove();
  const account=document.createElement('span');account.dataset.enrouteAccountNav='';account.style.cssText='display:inline-flex;align-items:center;gap:12px;flex-wrap:wrap';
  let name=null,receipt=null;
  try{name=localStorage.getItem(NAME);receipt=localStorage.getItem(KEY);}catch{}
  const link=document.createElement('a');link.href=signin;link.textContent='Sign in';account.append(link);
  if(name&&receipt&&/^[A-Za-z0-9_.-]{3,24}$/.test(name)){
   link.textContent='Account: '+name;link.title='Remembered account; protected actions require authentication';
   const exit=document.createElement('button');exit.type='button';exit.textContent='Sign out';exit.style.cssText='font:inherit;color:inherit;background:none;border:0;cursor:pointer;text-decoration:underline';
   exit.addEventListener('click',()=>{try{localStorage.removeItem(NAME);localStorage.removeItem(KEY);}catch{}location.assign(location.pathname.startsWith('/forum/')?'/forum/':'/');});account.append(exit);
  }
  nav.append(account);

 }
 window.addEventListener('storage',e=>{if(e.key===KEY||e.key===NAME||e.key===null)render();});
 document.addEventListener('DOMContentLoaded',render,{once:true});
 if(document.readyState!=='loading')render();
})();