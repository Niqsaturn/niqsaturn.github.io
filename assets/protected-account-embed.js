(() => {
 'use strict';
 const ORIGIN='https://enroute-accounts.ceric124.workers.dev',KEY='enroute-ad-free-receipt-v1',NAME='enroute-account-display-v1',UNTIL='enroute-web-session-until-v1';
 const changed=()=>window.dispatchEvent(new Event('enroute-account-display-changed'));
 function remember(data){
  if(!/^[a-z0-9_]{3,24}$/.test(data.username||'')||!Number.isSafeInteger(data.sessionExpiresAt)||data.sessionExpiresAt<=Date.now()||data.sessionExpiresAt>Date.now()+31*60*1000)return false;
  try{
   const prior=localStorage.getItem(NAME),p=data.proof;
   if(p&&typeof p.adFree==='boolean'&&/^v2\.[A-Za-z0-9_-]{70}$/.test(p.receipt||'')&&Date.parse(p.expiresAt)>Date.now())localStorage.setItem(KEY,p.receipt);
   else if(prior!==data.username)localStorage.removeItem(KEY);
   localStorage.setItem(NAME,data.username);localStorage.setItem(UNTIL,String(data.sessionExpiresAt));
  }catch{}
  changed();return true;
 }
 function clear(signout){try{if(signout||localStorage.getItem(UNTIL)){localStorage.removeItem(NAME);localStorage.removeItem(UNTIL);}if(signout)localStorage.removeItem(KEY);}catch{}changed();}
 function mount(container,{mode='account',fragment='',onSignedIn,onSignedOut,onPublished,onClose}={}){
  if(!container||!['account','forum'].includes(mode))return null;
  const frame=document.createElement('iframe');frame.title=mode==='forum'?'Protected forum editor':'Secure En-Route account';frame.className=mode==='forum'?'protected-forum-frame':'protected-account-frame';frame.referrerPolicy='no-referrer';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-top-navigation-by-user-activation allow-popups allow-popups-to-escape-sandbox');frame.src=ORIGIN+(mode==='forum'?'/forum/compose':'/')+(fragment?'#'+fragment:'');
  function receive(event){
   if(event.origin!==ORIGIN||event.source!==frame.contentWindow)return;
   const d=event.data;if(!d||d.type!=='enroute-protected-web-v1')return;
   if(d.action==='signed-in'||d.action==='session-restored'){if(remember(d)&&d.action==='signed-in')onSignedIn?.();}
   else if(d.action==='signed-out'){clear(true);onSignedOut?.();}
   else if(d.action==='anonymous')clear(false);
   else if(d.action==='forum-published'&&mode==='forum'&&Number.isInteger(d.topicId)&&d.topicId>0&&d.topicId<=99999999)onPublished?.(d.topicId);
   else if(d.action==='close-request'&&mode==='account')onClose?.();
  }
  window.addEventListener('message',receive);container.append(frame);
  return frame;
 }
 window.EnRouteProtected=Object.freeze({mount});
})();