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
 document.querySelector('#member-forget').addEventListener('click',()=>{localStorage.removeItem(KEY);status('The ad-free receipt was cleared. Non-member ads may appear on your next visit.');});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  button.disabled=true;status('Verifying your En-Route membership…');
  let token=null;
  try{
   const login=await json('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username.value.trim(),password:password.value})});
   token=login.accessToken;
   if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))throw Error('Secure account session could not be established.');
   const ent=await json('/api/ads/status',{method:'GET',headers:{'Authorization':'Bearer '+token}});
   if(ent.adFree===true&&typeof ent.receipt==='string'&&ent.receipt.length<200){
    localStorage.setItem(KEY,ent.receipt);
    status('Royal Pass verified. Website and forum ads will be suppressed. Opening your page…');
    location.assign(returnTo);return;
   }
   localStorage.removeItem(KEY);
   status(ent.billingReady===false?'Your game account is valid. Paid membership is not yet activated on this server, so ad-free subscription verification is not available.':'Your account is valid, but no active ad-free Royal Pass was found. Your game account remains fully playable.');
  }catch(error){status(error?.message||'Membership verification unavailable. Please try again.');}
  finally{token=null;password.value='';button.disabled=false;}
 });
})();