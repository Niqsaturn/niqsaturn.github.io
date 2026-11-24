(() => {
'use strict';
const BASE=window.EnRouteApiRoot?.replace(/\/api\/?$/,'')||'https://en-route.ringtail-anoles.ts.net:8443/enroute-account';
const PROOF='enroute-ad-free-receipt-v1',DISPLAY='enroute-account-display-v1';
const params=new URLSearchParams(location.search);
const reportRaw=params.get('report');
const reportId=reportRaw&&/^[1-9]\d{0,7}$/.test(reportRaw)?Number(reportRaw):null;
const replyRaw=params.get('reply');
const reportReplyId=reportId&&replyRaw&&/^[1-9]\d{0,7}$/.test(replyRaw)?Number(replyRaw):null;
const raw=params.get('topic');
const replyId=!reportId&&raw&&/^[1-9]\d{0,7}$/.test(raw)?Number(raw):null;
const categoryId=params.get('category')||'general';
const loginForm=document.querySelector('#login-form'),postForm=document.querySelector('#post-form');
const loginPanel=document.querySelector('#login-section'),editor=document.querySelector('#editor-section');
const loginStatus=document.querySelector('#login-status'),postStatus=document.querySelector('#post-status');
const category=document.querySelector('#forum-category'),title=document.querySelector('#forum-title');
const message=document.querySelector('#forum-message');
const categoryField=document.querySelector('#category-label'),titleField=document.querySelector('#title-label');
const postButton=document.querySelector('#forum-submit');
let bearer=null,username=null,ready=!(replyId||reportId),availableCategories=[],pendingPublish=false;
function updateCounter(){const target=document.querySelector('#forum-message-counter');if(target)target.textContent=message.value.length+' / '+message.maxLength+' characters';}
message.addEventListener('input',updateCounter);
function status(el,message){el.textContent=message;}
async function request(path,method='GET',payload=null,token=null){
 const options={method,credentials:'omit',redirect:'error',cache:'no-store',headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)};
 if(method==='POST'){options.headers['Content-Type']='application/json';options.body=JSON.stringify(payload);}
 if(token)options.headers.Authorization='Bearer '+token;
 const response=await fetch(BASE+path,options);
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(String(data.error||'Request rejected ('+response.status+')'));
 return data;
}
async function initialize(){
 try{
  const categories=await request('/api/forum/categories');
  availableCategories=categories.categories.filter(x=>x.postable);
  for(const c of availableCategories){const option=document.createElement('option');option.value=c.id;option.textContent=c.name;category.append(option);}
  category.value=availableCategories.some(x=>x.id===categoryId)?categoryId:'general';
  if(reportId){
   const response=await request('/api/forum/topics/'+reportId);
   document.querySelector('#editor-heading').textContent='REPORT: '+response.topic.title;
   document.querySelector('#login-heading').textContent='SIGN IN TO REPORT';
   titleField.hidden=true;categoryField.hidden=true;title.required=false;category.required=false;
   message.setAttribute('minlength','20');message.setAttribute('maxlength','600');
   message.placeholder='Explain the problem and why it requires moderation. Never include account passwords or other private information.';
   postButton.textContent='SEND PRIVATE REPORT';
   ready=true;
  }else if(replyId){
   const response=await request('/api/forum/topics/'+replyId);
   if(response.topic.state!=='open')throw Error('This topic is not accepting replies.');
   document.querySelector('#editor-heading').textContent='REPLY TO: '+response.topic.title;
   titleField.hidden=true;categoryField.hidden=true;title.required=false;category.required=false;
   message.setAttribute('minlength','3');
   message.setAttribute('maxlength','4000');
   postButton.textContent='PUBLISH REPLY';
   ready=true;
  }else{
   message.setAttribute('minlength','20');
   message.setAttribute('maxlength','8000');
   ready=true;
  }
  editor.insertAdjacentElement('afterend',loginPanel);
  editor.hidden=false;loginPanel.hidden=true;
  updateCounter();
 }catch(error){ready=false;status(loginStatus,'The forum is unavailable: '+error.message);}
}
loginForm.addEventListener('submit',async event=>{
 event.preventDefault();
 if(!ready){status(loginStatus,'Forum is not yet ready. Please try reloading.');return;}
 const button=document.querySelector('#forum-login'),userInput=document.querySelector('#forum-username'),passwordInput=document.querySelector('#forum-password');
 const name=userInput.value.trim(),password=passwordInput.value;
 button.disabled=true;status(loginStatus,'Checking your En-Route account…');
 try{
  const credentials=await request('/api/auth/login','POST',{username:name,password});
  if(typeof credentials.accessToken!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(credentials.accessToken))
   throw Error('Could not establish an authenticated session.');
  bearer=credentials.accessToken;
  // A forum sign-in also activates website ad-free mode for an active Royal
  // Pass. Only the bounded proof is retained; not the account access token.
  try{
   const adStatus=await request('/api/ads/status','GET',null,bearer);
   if((adStatus.adFree===true||adStatus.adFree===false)&&typeof adStatus.receipt==='string'&&adStatus.receipt.length<200){
    localStorage.setItem(PROOF,adStatus.receipt);const display=typeof credentials.username==='string'?credentials.username:name;
    if(/^[A-Za-z0-9_.-]{3,24}$/.test(display))localStorage.setItem(DISPLAY,display);
   }
  }catch{/* Posting remains available even when ad-free lookup is unavailable. */}
  username=typeof credentials.username==='string'?credentials.username:name;
  document.querySelector('#forum-signed-in').textContent='SIGNED IN AS '+username;
  loginPanel.hidden=true;editor.hidden=false;
  if(pendingPublish){pendingPublish=false;postForm.requestSubmit();}else message.focus();
  status(loginStatus,'');
 }catch(error){
  bearer=null;
  status(loginStatus,error.message||'Unable to sign in. Please verify your account details.');
 }finally{
  passwordInput.value='';
  button.disabled=false;
 }
});
postForm.addEventListener('submit',async event=>{
 event.preventDefault();
 if(!ready){status(postStatus,'The forum is still loading. Try again shortly.');return;}
 if(!bearer){
  pendingPublish=true;loginPanel.hidden=false;
  status(postStatus,'Sign in below to finish publishing. Your draft is preserved.');
  loginPanel.scrollIntoView({behavior:'smooth',block:'center'});
  document.querySelector('#forum-username').focus();
  return;
 }
 const button=document.querySelector('#forum-submit');
 const payload=reportId?{topicId:reportId,...(reportReplyId?{replyId:reportReplyId}:{}),reason:message.value.trim()}:replyId?{body:message.value.trim()}:{category:category.value,title:title.value.trim(),body:message.value.trim()};
 if(!replyId&&!reportId&&!availableCategories.some(c=>c.id===category.value)){status(postStatus,'Choose an available forum category.');return;}
 button.disabled=true;
 status(postStatus,reportId?'Submitting your private report…':'Publishing your discussion…');
 try{
  const endpoint=reportId?'/api/forum/reports':replyId?'/api/forum/topics/'+replyId+'/replies':'/api/forum/topics';
  const data=await request(endpoint,'POST',payload,bearer);
  if(reportId&&data.report?.received!==true)throw Error('The report was not accepted.');
  const id=reportId||replyId||data.topic?.id;
  if(!id)throw Error('The forum did not return a topic ID.');
  bearer=null;
  passwordInputClear();
  status(postStatus,reportId?'Report received privately. Returning to discussion…':'Published. Opening your topic…');
  location.assign('/forum/?topic='+encodeURIComponent(id));
 }catch(error){
  if(/expired|revoked|authentication required|401/i.test(error.message)){bearer=null;pendingPublish=false;loginPanel.hidden=false;editor.hidden=false;}
  status(postStatus,error.message||'Unable to publish. Please try again.');
  button.disabled=false;
 }
});
function passwordInputClear(){const input=document.querySelector('#forum-password');if(input)input.value='';}
const related=document.querySelector('#forum-related-topics');let suggestionTimer=null,suggestionNumber=0;
title.addEventListener('input',()=>{
 clearTimeout(suggestionTimer);const text=title.value.trim(),ticket=++suggestionNumber;
 if(replyId||reportId||text.length<6){related.hidden=true;related.replaceChildren();return;}
 suggestionTimer=setTimeout(async()=>{
  try{
   const result=await request('/api/forum/topics?page=1&sort=latest&q='+encodeURIComponent(text.slice(0,100)));
   if(ticket!==suggestionNumber)return;
   const items=result.items?.filter(t=>t.title.toLowerCase()!==text.toLowerCase()).slice(0,4)||[];
   if(!items.length){related.hidden=true;related.replaceChildren();return;}
   const label=document.createElement('strong');label.textContent='SIMILAR DISCUSSIONS';
   const links=items.map(item=>{const a=document.createElement('a');a.href='/forum/?topic='+encodeURIComponent(item.id);a.textContent=item.title;return a;});
   related.replaceChildren(label,...links);related.hidden=false;
  }catch{if(ticket===suggestionNumber)related.hidden=true;}
 },450);
});
window.addEventListener('pagehide',()=>{bearer=null;passwordInputClear();clearTimeout(suggestionTimer);});
window.addEventListener('storage',e=>{if((e.key===DISPLAY&&e.newValue!==username)||e.key===null){bearer=null;username=null;pendingPublish=false;document.querySelector('#forum-signed-in').textContent='';status(postStatus,'Sign in again before publishing. Your draft is preserved.');}});
document.querySelector('#forum-login').disabled=false;
void initialize();
})();