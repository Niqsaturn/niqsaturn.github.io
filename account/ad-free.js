(() => {
 'use strict';
 const API=window.EnRouteApiRoot||'https://en-route.ringtail-anoles.ts.net:8443/enroute-account/api';
 const KEY='enroute-ad-free-receipt-v1',NAME='enroute-account-display-v1';
 const form=document.querySelector('#member-auth-form');
 const result=document.querySelector('#member-result');
 const button=document.querySelector('#member-check');
 const username=document.querySelector('#member-username');
 const password=document.querySelector('#member-password');
 const returnTo=new URLSearchParams(location.search).get('return')==='/forum/'?'/forum/':'/';
 const status=text=>{result.textContent=text;};
 async function json(url,options){
  const response=await fetch(API+(url.startsWith('/api/')?url.slice(4):url),{credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(12000),...options});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data.error||'Membership service unavailable ('+response.status+').');
  return data;
 }
 document.querySelector('#member-forget')?.addEventListener('click',()=>{localStorage.removeItem(NAME);localStorage.removeItem(KEY);location.assign(returnTo);});
 if(!form||!result||!button||!username||!password)return;
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  button.disabled=true;status('Signing in and checking your account…');
  let token=null;
  try{
   const login=await json('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username.value.trim(),password:password.value})});
   token=login.accessToken;
   if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))throw Error('Secure account session could not be established.');
   const displayName=typeof login.account?.username==='string'?login.account.username:typeof login.username==='string'?login.username:username.value.trim();
   const remember=()=>{if(/^[A-Za-z0-9_.-]{3,24}$/.test(displayName))localStorage.setItem(NAME,displayName);};
   const ent=await json('/api/ads/status',{method:'GET',headers:{'Authorization':'Bearer '+token}});
   if(typeof ent.receipt==='string'&&/^v2\.[A-Za-z0-9_-]{70}$/.test(ent.receipt)){
    localStorage.setItem(KEY,ent.receipt);remember();
    status(ent.adFree===true?'Royal Pass active. Website and forum ads are off.':'Signed in. Royal Pass is optional.');
    location.assign(returnTo);return;
   }
   if(ent.adFree===true&&typeof ent.receipt==='string'&&ent.receipt.length<200){
    localStorage.setItem(KEY,ent.receipt);remember();
    location.assign(returnTo);return;
   }
   if(ent.adFree!==false)throw Error('Account advertising status is unavailable.');
   localStorage.removeItem(KEY);localStorage.removeItem(NAME);
   status(ent.billingReady===false?'Signed in. Membership purchases are not active yet.':'Signed in. You can continue with your free account.');
   location.assign(returnTo);
  }catch(error){status(error?.message||'Account sign-in unavailable. Please try again.');}
  finally{token=null;password.value='';button.disabled=false;}
 });
 button.disabled=false;
})();