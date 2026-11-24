/* En-Route public web placements, never loaded in the native game or credential pages.
 * Only publisher-supplied classic banners and native banner are allowed.
 * No Popunder, Social Bar, Smartlink, autoplay or interstitial scripts.
 */
(() => {
 'use strict';
 const API=window.EnRouteApiRoot||'https://en-route.ringtail-anoles.ts.net:8443/enroute-account/api';
 const KEY='enroute-ad-free-receipt-v1';
 const GOOGLE_CLIENT='ca-pub-7639855617393587';
 const GOOGLE_URL='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+GOOGLE_CLIENT;
 const CONSENT_KEY='enroute-ads-consent-v1';
 const GOOGLE_UNITS=Object.freeze({'6267361496':true,'7590297438':true});
 let googleLoaded=false,googleConsent=false,googleConsentRegistered=false;
 let googleRequested=new WeakSet();
 function hasConsent(){try{return localStorage.getItem(CONSENT_KEY)==='allow'&&navigator.globalPrivacyControl!==true;}catch{return false;}}
 function isHome(){return location.pathname==='/'||location.pathname==='/index.html';}
 function isOverview(){return location.pathname==='/forum/'&&!location.search&&!!document.querySelector('.forum-category-grid');}
 function adsPermitted(){return permission===true&&hasConsent()&&!document.hidden;}
 function googleBoxes(){return [...document.querySelectorAll('[data-google-slot]')];}
 function syncGoogle(){
  if(!adsPermitted()||!googleConsent||!googleLoaded||!isHome())return;
  for(const box of googleBoxes()){
   const slot=box.dataset.googleSlot;
   if(!Object.hasOwn(GOOGLE_UNITS,slot)||googleRequested.has(box))continue;
   const mount=box.querySelector('[data-google-mount]');
   if(!mount||!box.parentElement||box.parentElement.clientWidth<280)continue;
   const observer=new IntersectionObserver(entries=>{
    if(!entries.some(e=>e.isIntersecting)||!adsPermitted()||!googleConsent||googleRequested.has(box))return;
    observer.disconnect();googleRequested.add(box);
    const ad=document.createElement('ins');ad.className='adsbygoogle';ad.style.display='block';
    ad.dataset.adClient=GOOGLE_CLIENT;ad.dataset.adSlot=slot;ad.dataset.adFormat='auto';ad.dataset.fullWidthResponsive='true';
    mount.append(ad);box.hidden=false;
    const statusObserver=new MutationObserver(()=>{if(ad.dataset.adStatus==='unfilled'){statusObserver.disconnect();box.hidden=true;}});
    statusObserver.observe(ad,{attributes:true,attributeFilter:['data-ad-status']});
    try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch{box.hidden=true;statusObserver.disconnect();}
   },{rootMargin:'350px 0px'});
   if(box.dataset.googleObserved!=='true'){box.dataset.googleObserved='true';observer.observe(box.parentElement);}
  }
 }
 function registerGoogleConsent(){
  if(googleConsentRegistered||typeof window.__tcfapi!=='function')return;
  googleConsentRegistered=true;
  window.__tcfapi('addEventListener',2,(tc,ok)=>{
   if(!ok||!tc||!['tcloaded','useractioncomplete'].includes(tc.eventStatus))return;
   const granted=tc.gdprApplies===false||(tc.gdprApplies===true&&!!tc.tcString&&tc.vendor?.consents?.[755]===true&&[1,3,4].every(id=>tc.purpose?.consents?.[id]===true));
   googleConsent=granted;
   if(!granted){googleBoxes().forEach(box=>{box.hidden=true;});return;}
   syncGoogle();
  });
 }
 function maybeLoadGoogle(){
  // Bootstrap Google's CMP for consenting, eligible free visitors only.
  // Auto Ads must remain OFF. Manual requests wait for a certified CMP signal.
  if(!adsPermitted()||!isHome()||location.protocol!=='https:')return;
  if(!googleLoaded){
   googleLoaded=true;
   const script=document.createElement('script');script.async=true;script.crossOrigin='anonymous';script.src=GOOGLE_URL;script.id='enroute-adsense';
   script.onload=()=>{registerGoogleConsent();syncGoogle();};
   script.onerror=()=>{googleLoaded=false;script.remove();};
   document.head.append(script);
  }
  registerGoogleConsent();syncGoogle();
 }
 function addConsentControls(){
  if(!isHome()&&!location.pathname.startsWith('/forum/'))return;
  const footer=document.querySelector('footer');
  if(!footer)return;
  const toggle=document.createElement('button');toggle.type='button';toggle.className='enroute-privacy-toggle';toggle.textContent='AD PRIVACY';
  footer.append(toggle);
  const panel=document.createElement('section');panel.className='enroute-ad-consent';panel.hidden=true;panel.setAttribute('aria-label','Advertising privacy');
  panel.innerHTML='<div><strong>Advertising privacy</strong><p>Optional advertising uses third-party cookies. Choose whether to allow ads. Royal Pass members remain ad-free. <a href="/privacy.html">Privacy policy</a></p></div><div class="enroute-consent-actions"><button type="button" data-ad-choice="deny">Decline</button><button type="button" data-ad-choice="allow">Allow ads</button></div>';
  footer.before(panel);
  const open=()=>{panel.hidden=false;panel.scrollIntoView({block:'nearest'});panel.querySelector('button')?.focus({preventScroll:true});};
  toggle.addEventListener('click',()=>panel.hidden?open():panel.hidden=true);
  for(const button of panel.querySelectorAll('[data-ad-choice]'))button.addEventListener('click',()=>{
   try{localStorage.setItem(CONSENT_KEY,button.dataset.adChoice);}catch{return;}
   panel.hidden=true;
   // User-directed reload clears previously executed third-party scripts.
   location.reload();
  });
  try{if(permission===true&&!localStorage.getItem(CONSENT_KEY)&&navigator.globalPrivacyControl!==true)panel.hidden=false;}catch{}
 }
 const CLASSIC='https://bellnewyork.org/22/';
 const NATIVE='https://bellnewyork.org/21/be1a8a1c143387189d74d1320ee44168';
 const NATIVE_CONTAINER='container-be1a8a1c143387189d74d1320ee44168';
 const UNITS=Object.freeze({
  'home-after-trailer':{
   desktop:{key:'fb798cb17bbebdd528f06289b3032e4f',width:728,height:90},
   mobile:{key:'4865dab6a42861a675c208bd9ca29990',width:320,height:50}},
  'home-after-download':{
   desktop:{key:'a0261380ef2e82bd8c4b5a434343b60e',width:468,height:60},
   mobile:{key:'0110caa50cdb0e60674a5e3e367fd539',width:300,height:250}},
  'forum-above-categories':{
   desktop:{key:'0110caa50cdb0e60674a5e3e367fd539',width:300,height:250},
   mobile:{key:'0110caa50cdb0e60674a5e3e367fd539',width:300,height:250}},
  'forum-below-categories':{native:true,width:Math.min(728,innerWidth-30),height:260}
 });
 let permission=null;
 let statusPromise=null;
 let checkedAt=0;
 let checkInFlight=false;
 let mountingEpoch=null;
 const STATUS_INTERVAL=120000;
 let refreshInFlight=false;
 // Invalidate all pending placements when the forum navigates away.
 let visibilityEpoch=0;
 const lazyReady=new Set(),lazyObservers=new Map();
 function nearPlacement(box,onlyForum){
  const name=box.dataset.adsterraZone;
  const anchor=document.querySelector('[data-ad-lazy-anchor="'+name+'"]');
  if(!anchor||lazyReady.has(name)||typeof IntersectionObserver!=='function')return true;
  if(!lazyObservers.has(name)){
   const observer=new IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting))return;
    observer.disconnect();lazyObservers.delete(name);lazyReady.add(name);
    if(permission===true)void show(onlyForum);
   },{rootMargin:'450px 0px',threshold:0});
   lazyObservers.set(name,observer);observer.observe(anchor);
  }
  return false;
 }
 function allZones(){return [...document.querySelectorAll('[data-adsterra-zone]')];}
 function reset(){allZones().forEach(el=>{el.hidden=true;el.dataset.adsterraReady='false';});}
 async function mayShowAds(){
  let receipt=null;
  try{receipt=localStorage.getItem(KEY);}catch{return false;}
  if(!receipt)return true;
  try{
   const response=await fetch(API+'/ads/verify',{
    method:'POST',mode:'cors',credentials:'omit',redirect:'error',cache:'no-store',
    referrerPolicy:'no-referrer',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({receipt}),signal:AbortSignal.timeout(7000)
   });
   if(!response.ok)return false; // If the service is unavailable, do not accidentally display ads to a member.
   const result=await response.json();
   if(result.adFree!==true&&result.adFree!==false)return false;
   // Keep the opaque ad-only browser proof for free AND paid accounts.
   // Never overwrite a different login or sign-out that occurred during fetch.
   if(localStorage.getItem(KEY)!==receipt)return false;
   if(typeof result.receipt==='string'&&/^v2\.[A-Za-z0-9_-]{70}$/.test(result.receipt)){
    if(result.receipt!==receipt)localStorage.setItem(KEY,result.receipt);
   }else if(result.adFree===false){
    localStorage.removeItem(KEY);
   }
   return result.adFree===false;
  }catch{return false;}
 }
 function ensurePermission(force=false){
  if(checkInFlight)return statusPromise;
  if(!force&&statusPromise&&Date.now()-checkedAt<STATUS_INTERVAL)return statusPromise;
  checkInFlight=true;
  statusPromise=mayShowAds().then(result=>(permission=result),()=>(permission=false))
   .finally(()=>{checkedAt=Date.now();checkInFlight=false;});
  return statusPromise;
 }
 function eligible(box){
  return !box.closest('form')&&box.querySelector('[data-adsterra-mount]')&&box.dataset.adsterraZone in UNITS;
 }
 function creativePresent(mount){
  return !!mount.querySelector('iframe,object,embed,img[src],video[src],a[href] img');
 }
 function awaitCreative(box,mount,script,epoch){
  box.hidden=false;
  box.dataset.adsterraReady='loading';
  box.dataset.adsterraState='loading';
  return new Promise(resolve=>{
   let settled=false;
   const observer=new MutationObserver(()=>{
    if(creativePresent(mount))finish(true);
   });
   const timeout=setTimeout(()=>finish(false),9500);
   function finish(filled){
    if(settled)return;
    settled=true;clearTimeout(timeout);observer.disconnect();
    if(epoch!==visibilityEpoch){resolve(false);return;}
    box.dataset.adsterraReady=filled?'true':'false';
    box.dataset.adsterraState=filled?'filled':'no-fill';
    box.hidden=!filled;
    if(!filled)mount.replaceChildren();
    resolve(filled);
   }
   observer.observe(mount,{childList:true,subtree:true});
   script.onerror=()=>finish(false);
   script.onload=()=>{if(creativePresent(mount))finish(true);};
   if(creativePresent(mount))finish(true);
  });
 }
 function placementWidth(box){
  const parent=box.parentElement;if(!parent)return 0;
  const parentStyle=getComputedStyle(parent),slotStyle=getComputedStyle(box);
  const padding=s=>(parseFloat(s.paddingLeft)||0)+(parseFloat(s.paddingRight)||0);
  return Math.min(parent.clientWidth-padding(parentStyle),parseFloat(slotStyle.maxWidth)||Infinity)-padding(slotStyle);
 }
 async function mountClassic(box,unit,epoch){
  const mount=box.querySelector('[data-adsterra-mount]');
  if(!mount||unit.width>placementWidth(box))return false;
  mount.style.minHeight=unit.height+'px';
  mount.style.maxWidth=unit.width+'px';
  mount.style.margin='0 auto';
  const setting=document.createElement('script');
  setting.textContent='window.atOptions='+JSON.stringify({key:unit.key,format:'iframe',height:unit.height,width:unit.width,params:{}})+';';
  const script=document.createElement('script');
  script.async=false;
  script.src=CLASSIC+unit.key;
  script.dataset.cfasync='false';
  // A downloaded vendor script is not proof that an ad has filled.
  // Keep the reserved slot only if it contains real creative media.
  const filled=awaitCreative(box,mount,script,epoch);
  mount.append(setting,script);
  return filled;
 }
 async function mountNative(box,epoch){
  const mount=box.querySelector('[data-adsterra-mount]');
  if(!mount)return false;
  mount.style.minHeight='200px';
  const container=document.createElement('div');container.id=NATIVE_CONTAINER;
  const script=document.createElement('script');
  script.async=true;script.dataset.cfasync='false';script.src=NATIVE;
  const filled=awaitCreative(box,mount,script,epoch);
  mount.append(container,script);
  return filled;
 }
 async function show(onlyForum=false){
  const epoch=visibilityEpoch;
  if(mountingEpoch===epoch)return false;
  mountingEpoch=epoch;
  try{
  const routeAllowed=()=>{
   if(epoch!==visibilityEpoch||!hasConsent()||permission!==true||(!onlyForum&&!isHome()))return false;
   if(onlyForum&&(!location.pathname.startsWith('/forum/')||location.search||
      !document.querySelector('.forum-category-grid'))){
    hide();return false;
   }
   return true;
  };
  if(!await ensurePermission()){
   if(epoch===visibilityEpoch){
    const mounted=allZones().some(box=>box.querySelector('[data-adsterra-mount]')?.children.length);
    if(mounted)hide();else reset();
   }
   return false;
  }
  if(!routeAllowed()||!hasConsent())return false;
  maybeLoadGoogle();
  const zones=allZones().filter(eligible);
  for(const box of zones){
   if(!routeAllowed())return false;
   if(box.dataset.adsterraReady==='true'){box.hidden=false;continue;}
   if(box.dataset.adsterraState==='no-fill'||!nearPlacement(box,onlyForum))continue;
   const unit=UNITS[box.dataset.adsterraZone];
   if(!unit)continue;
   if(unit.native){
    if(!onlyForum)continue;
    await mountNative(box,epoch);
    if(!routeAllowed())return false;
    continue;
   }
   const preferred=innerWidth<720?unit.mobile:unit.desktop;
   const size=preferred&&preferred.width<=placementWidth(box)?preferred:unit.mobile&&unit.mobile.width<=placementWidth(box)?unit.mobile:null;
   if(size){
    await mountClassic(box,size,epoch);
    if(!routeAllowed())return false;
   }
  }
  return true;
  }finally{if(mountingEpoch===epoch)mountingEpoch=null;}
 }
 function hide(){
  visibilityEpoch++;
  googleBoxes().forEach(box=>{box.hidden=true;});
  allZones().forEach(box=>{
   box.hidden=true;
   box.dataset.adsterraReady='false';
   delete box.dataset.adsterraState;
   const mount=box.querySelector('[data-adsterra-mount]');
   if(mount)mount.replaceChildren();
  });
 }
 window.EnRouteAdPlacements=Object.freeze({show,hide});
 void ensurePermission().then(()=>{addConsentControls();if(isHome())void show(false);});
 async function refreshEntitlement(force=false){
  if(refreshInFlight||document.hidden)return;
  if(!force&&Date.now()-checkedAt<STATUS_INTERVAL)return;
  // Anonymous pages do not contact the account service unnecessarily.
  let receipt;
  try{receipt=localStorage.getItem(KEY);}catch{return;}
  if(!receipt&&!force&&permission===true)return;
  refreshInFlight=true;
  try{
   const before=permission;
   const allowed=await ensurePermission(true);
   if(before===allowed)return;
   if(!allowed){
    const hadVendor=allZones().some(box=>box.querySelector('[data-adsterra-mount]')?.children.length);
    hide();
    // A reload removes already-executed vendor JS from this document.
    // Stop and remove the visible ads immediately; never refresh ad inventory automatically.
    googleBoxes().forEach(box=>{box.hidden=true;box.querySelector('[data-google-mount]')?.replaceChildren();});
    return;
   }
   const forum=location.pathname.startsWith('/forum/');
   if(isHome()||isOverview())void show(forum);
  }finally{refreshInFlight=false;}
 }
 window.addEventListener('storage',event=>{
  if(event.key===CONSENT_KEY){hide();return;}
  if(event.key===KEY||event.key===null){hide();permission=null;checkedAt=0;void refreshEntitlement(true);}
 });
 window.addEventListener('focus',()=>{registerGoogleConsent();void refreshEntitlement();});
 window.addEventListener('pageshow',()=>void refreshEntitlement(true));
 window.addEventListener('load',()=>{registerGoogleConsent();syncGoogle();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refreshEntitlement();});
 window.setInterval(()=>{void refreshEntitlement();if(googleLoaded){registerGoogleConsent();syncGoogle();}},STATUS_INTERVAL);
})();