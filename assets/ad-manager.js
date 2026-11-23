/* En-Route public web placements, never loaded in the native game or credential pages.
 * Only publisher-supplied classic banners and native banner are allowed.
 * No Popunder, Social Bar, Smartlink, autoplay or interstitial scripts.
 */
(() => {
 'use strict';
 const API=window.EnRouteApiRoot||'https://en-route.ringtail-anoles.ts.net:8443/enroute-account/api';
 const KEY='enroute-ad-free-receipt-v1';
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
 let loaded=false;
 // Invalidate all pending placements when the forum navigates away.
 let visibilityEpoch=0;
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
   if(result.adFree===true)return false;
   localStorage.removeItem(KEY);
   return true;
  }catch{return false;}
 }
 function ensurePermission(){
  if(!statusPromise)statusPromise=mayShowAds().then(result=>(permission=result),()=>(permission=false));
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
    if(epoch!==visibilityEpoch)filled=false;
    settled=true;clearTimeout(timeout);observer.disconnect();
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
 async function mountClassic(box,unit,epoch){
  const mount=box.querySelector('[data-adsterra-mount]');
  if(!mount||unit.width>Math.max(window.innerWidth-18,0))return false;
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
  const routeAllowed=()=>{
   if(epoch!==visibilityEpoch)return false;
   if(onlyForum&&(!location.pathname.startsWith('/forum/')||location.search||
      !document.querySelector('.forum-category-grid'))){
    hide();return false;
   }
   return true;
  };
  if(!await ensurePermission()){
   if(epoch===visibilityEpoch)reset();
   return false;
  }
  if(!routeAllowed())return false;
  const zones=allZones().filter(eligible);
  for(const box of zones){
   if(!routeAllowed())return false;
   if(box.dataset.adsterraReady==='true'){box.hidden=false;continue;}
   const unit=UNITS[box.dataset.adsterraZone];
   if(!unit)continue;
   if(unit.native){
    if(!onlyForum)continue;
    await mountNative(box,epoch);
    if(!routeAllowed())return false;
    continue;
   }
   const size=innerWidth<720?unit.mobile:unit.desktop;
   if(size){
    await mountClassic(box,size,epoch);
    if(!routeAllowed())return false;
   }
  }
  loaded=true;return true;
 }
 function hide(){
  visibilityEpoch++;
  allZones().forEach(box=>{
   box.hidden=true;
   box.dataset.adsterraReady='false';
   const mount=box.querySelector('[data-adsterra-mount]');
   if(mount)mount.replaceChildren();
  });
 }
 window.EnRouteAdPlacements=Object.freeze({show,hide});
 if(!location.pathname.startsWith('/forum/')){
  void show(false);
 }
 window.addEventListener('storage',event=>{
  if(event.key===KEY){hide();statusPromise=null;permission=null;location.reload();}
 });
})();