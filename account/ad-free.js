(() => {
 'use strict';
 const API='https://en-route.ringtail-anoles.ts.net:8443/enroute-account';
 const KEY='enroute-ad-free-receipt-v1';
 const form=document.querySelector('#member-auth-form');
 const result=document.querySelector('#member-result');
 const button=document.querySelector('#member-check');
 const username=document.querySelector('#member-username');
 const password=document.querySelector('#member-password');
 const returnTo=new URLSearchParams(location.search).get('return')==='/forum/'?'/forum/':'/';
 const status=text=>{result.textContent=text;};
 async function json(url,options){
  const response=await fetch(API+url,{credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(12000),...options});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data.error||'Membership service unavailable ('+response.status+').');
  return data;
 }
 document.querySelector('#member-forget').addEventListener('click',()=>{localStorage.removeItem(KEY);status('This browser no longer remembers ad-free browsing. You can sign in again whenever you like.');});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  button.disabled=true;status('Signing in and checking your account…');
  let token=null;
  try{
   const login=await json('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username.value.trim(),password:password.value})});
   token=login.accessToken;
   if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))throw Error('Secure account session could not be established.');
   const ent=await json('/api/ads/status',{method:'GET',headers:{'Authorization':'Bearer '+token}});
   if(ent.adFree===true&&typeof ent.receipt==='string'&&ent.receipt.length<200){
    localStorage.setItem(KEY,ent.receipt);
    status('Royal Pass active. Website and forum ads are off for this browser. Opening your page…');
    location.assign(returnTo);return;
   }
   localStorage.removeItem(KEY);
   status(ent.billingReady===false?'Signed in. Membership purchases are not active on this server yet; your free game account remains available.':'Signed in. This account has no active Royal Pass, so website ads may appear. You can continue playing for free.');
  }catch(error){status(error?.message||'Account sign-in unavailable. Please try again.');}
  finally{token=null;password.value='';button.disabled=false;}
 });
})();