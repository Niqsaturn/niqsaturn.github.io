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
  if(!response.ok)throw Error(typeof data.error==='string'?data.error:'Account service unavailable ('+response.status+').');
  return data;
 }
 let token=null;
 async function endSession(){
  const value=token;token=null;
  if(typeof value!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(value))return;
  try{await fetch(API+'/auth/logout',{method:'POST',credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer',headers:{'Content-Type':'application/json','Authorization':'Bearer '+value},body:'{}',keepalive:true,signal:AbortSignal.timeout(3500)});}catch{/* Access token is short lived; never persist it. */}
 }
 window.addEventListener('pagehide',()=>{void endSession();});
 document.querySelector('#member-forget')?.addEventListener('click',()=>{localStorage.removeItem(NAME);localStorage.removeItem(KEY);location.assign(returnTo);});
 if(!form||!result||!button||!username||!password)return;
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!form.reportValidity())return;
  button.disabled=true;status('Signing in…');
  try{
   const login=await json('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username.value.trim(),password:password.value})});
   token=login.accessToken;
   if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))throw Error('Secure account session could not be established.');
   const displayName=typeof login.account?.username==='string'?login.account.username:typeof login.username==='string'?login.username:username.value.trim();
   const ent=await json('/api/ads/status',{method:'GET',headers:{'Authorization':'Bearer '+token}});
   if(typeof ent.adFree!=='boolean'||typeof ent.receipt!=='string'||!/^v2\.[A-Za-z0-9_-]{70}$/.test(ent.receipt)||!Number.isFinite(Date.parse(ent.expiresAt))||Date.parse(ent.expiresAt)<=Date.now())
    throw Error('Account status could not be verified. Please try again.');
   if(!/^[A-Za-z0-9_.-]{3,24}$/.test(displayName))throw Error('Account name could not be verified.');
   try{
    localStorage.setItem(KEY,ent.receipt);
    localStorage.setItem(NAME,displayName);
   }catch{
    try{localStorage.removeItem(KEY);localStorage.removeItem(NAME);}catch{}
    throw Error('Sign-in preferences could not be saved. Enable site storage and try again.');
   }
   status(ent.adFree?'Royal Pass active.':'Account verified.');
   await endSession();location.assign(returnTo);return;
  }catch(error){status(error?.message||'Account sign-in unavailable. Please try again.');}
  finally{await endSession();password.value='';button.disabled=false;}
 });
 button.disabled=false;
 const resetLink=document.querySelector('#forgot-password');
 const resetSection=document.querySelector('#reset-section');
 const requestForm=document.querySelector('#reset-request-form');
 const confirmForm=document.querySelector('#reset-confirm-form');
 const resetStatus=document.querySelector('#reset-result');
 const backLink=document.querySelector('#reset-back');
 if(!resetLink||!resetSection||!requestForm||!confirmForm||!resetStatus||!backLink)return;
 function openReset(){
  form.hidden=true;form.style.display='none';result.hidden=true;resetLink.hidden=true;
  password.value='';resetSection.hidden=false;requestForm.hidden=false;confirmForm.hidden=true;
  resetStatus.textContent='';requestForm.elements.email.focus();
 }
 function closeReset(){
  resetSection.hidden=true;requestForm.reset();confirmForm.reset();resetStatus.textContent='';
  form.hidden=false;form.style.display='';result.hidden=false;resetLink.hidden=false;username.focus();
 }
 resetLink.addEventListener('click',event=>{event.preventDefault();openReset();});
 backLink.addEventListener('click',event=>{event.preventDefault();closeReset();});
 requestForm.addEventListener('submit',async event=>{
  event.preventDefault();if(!requestForm.reportValidity())return;
  const submit=requestForm.querySelector('button[type=submit]');submit.disabled=true;
  resetStatus.textContent='Requesting a recovery code…';
  try{
   await json('/api/auth/reset/request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:requestForm.elements.email.value.trim()})});
   requestForm.reset();requestForm.hidden=true;confirmForm.hidden=false;
   resetStatus.textContent='If that email is associated with an account, a recovery code will be sent. Check your inbox and spam folder.';
   confirmForm.elements.code.focus();
  }catch{resetStatus.textContent='Recovery is temporarily unavailable. Please try again later.';}
  finally{submit.disabled=false;}
 });
 confirmForm.addEventListener('submit',async event=>{
  event.preventDefault();if(!confirmForm.reportValidity())return;
  const fields=confirmForm.elements;
  if(fields.password.value!==fields.passwordConfirmation.value){resetStatus.textContent='Passwords do not match.';return;}
  const submit=confirmForm.querySelector('button[type=submit]');submit.disabled=true;
  try{
   await json('/api/auth/reset/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:fields.code.value.trim(),password:fields.password.value,passwordConfirmation:fields.passwordConfirmation.value})});
   try{localStorage.removeItem(KEY);localStorage.removeItem(NAME);}catch{}
   closeReset();status('Password reset. Sign in with your new password.');
  }catch{resetStatus.textContent='The recovery code is invalid, expired, or the service is unavailable. Check the code or request a new one.';}
  finally{fields.password.value='';fields.passwordConfirmation.value='';submit.disabled=false;}
 });
 document.querySelector('#reset-retry')?.addEventListener('click',()=>{confirmForm.reset();confirmForm.hidden=true;requestForm.hidden=false;resetStatus.textContent='';requestForm.elements.email.focus();});
 if(new URLSearchParams(location.search).get('forgot')==='1')openReset();
})();