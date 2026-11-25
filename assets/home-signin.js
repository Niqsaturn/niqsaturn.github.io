(() => {
 'use strict';
 const query=new URLSearchParams(location.search);
 if(location.pathname==='/account/ad-free.html'){
  const target=new URL('/',location.origin);target.searchParams.set('signin','1');
  if(query.get('return')==='/forum/')target.searchParams.set('return','/forum/');
  if(query.get('forgot')==='1')target.searchParams.set('forgot','1');
  location.replace(target.pathname+target.search);return;
 }
 if(query.get('signin')!=='1')return;
 const header=document.querySelector('.header-inner'),trigger=document.querySelector('[data-account-controls] [data-enroute-account-nav]');if(!header||!trigger)return;
 header.insertAdjacentHTML('beforeend',"<section id=\"home-account-panel\" class=\"member-access\" aria-labelledby=\"home-account-heading\">\n<div class=\"account-panel-heading\"><h2 id=\"home-account-heading\">Sign in</h2><a id=\"signin-cancel\" class=\"account-panel-close\" href=\"/\" aria-label=\"Close sign in\">×</a></div>\n<form id=\"member-auth-form\" method=\"post\" action=\"/?signin=1\" autocomplete=\"on\">\n<label>Username<input id=\"member-username\" type=\"text\" name=\"username\" minlength=\"3\" maxlength=\"24\" autocomplete=\"username\" required></label>\n<label>Password<input id=\"member-password\" type=\"password\" name=\"password\" maxlength=\"128\" autocomplete=\"current-password\" required></label>\n<button id=\"member-check\" type=\"submit\" disabled>Sign in</button>\n</form>\n<div id=\"member-result\" role=\"status\" aria-live=\"polite\"></div>\n<div class=\"account-actions\"><a id=\"forgot-password\" href=\"/?signin=1&amp;forgot=1\">Forgot password?</a><a href=\"/register.html\">Sign up</a></div>\n<section id=\"reset-section\" hidden aria-labelledby=\"reset-heading\">\n<h2 id=\"reset-heading\">Reset password</h2>\n<form id=\"reset-request-form\" method=\"post\" action=\"/?signin=1\" autocomplete=\"on\">\n<label>Account email<input type=\"email\" name=\"email\" maxlength=\"254\" autocomplete=\"email\" required></label>\n<button type=\"submit\">Send recovery code</button>\n</form>\n<form id=\"reset-confirm-form\" method=\"post\" action=\"/?signin=1\" hidden autocomplete=\"off\">\n<label>Recovery code<input name=\"code\" minlength=\"43\" maxlength=\"43\" pattern=\"[A-Za-z0-9_-]{43}\" autocomplete=\"one-time-code\" required spellcheck=\"false\"></label>\n<label>New password (15 or more characters)<input type=\"password\" name=\"password\" minlength=\"15\" maxlength=\"128\" autocomplete=\"new-password\" required></label>\n<label>Confirm new password<input type=\"password\" name=\"passwordConfirmation\" minlength=\"15\" maxlength=\"128\" autocomplete=\"new-password\" required></label>\n<button type=\"submit\">Reset password</button>\n<button type=\"button\" class=\"minor\" id=\"reset-retry\">Request a new code</button>\n</form>\n<p id=\"reset-result\" role=\"status\" aria-live=\"polite\"></p>\n<a href=\"/?signin=1\" id=\"reset-back\">Back to sign in</a>\n</section>\n\n<p class=\"account-panel-privacy\"><a href=\"/privacy.html\">Privacy policy</a></p>\n</section>");
 const panel=document.querySelector('#home-account-panel');
 const close=()=>location.assign(query.get('return')==='/forum/'?'/forum/':'/');
 document.querySelector('#signin-cancel').href=query.get('return')==='/forum/'?'/forum/':'/';
 trigger.setAttribute('aria-expanded','true');trigger.setAttribute('aria-controls','home-account-panel');trigger.href='/';
 trigger.addEventListener('click',event=>{event.preventDefault();close();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
 const robots=document.querySelector('meta[name=robots]');if(robots)robots.content='noindex,follow';
 const auth=document.createElement('script');auth.src='/account/ad-free.js?v=20261125-2';auth.async=false;
 auth.onload=()=>{if(query.get('forgot')!=='1')document.querySelector('#member-username')?.focus({preventScroll:true});};
 document.head.append(auth);
})();