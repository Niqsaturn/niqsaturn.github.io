(() => {
 'use strict';
 const query=new URLSearchParams(location.search);
 if(query.get('signin')!=='1')return;
 const back=query.get('return')==='/forum/'?'/forum/':'/';
 const main=document.querySelector('main');if(!main)return;
 const style=document.createElement('style');style.textContent='.home-signin{max-width:520px;margin:64px auto 80px;padding:32px;border:1px solid #b9cce044;background:#101d2e;border-radius:14px}.home-signin h1{font-size:clamp(28px,5vw,48px);margin:0 0 16px}.home-signin form{display:grid;gap:18px;margin:24px 0}.home-signin label{display:grid;gap:8px;font-weight:700}.home-signin input{min-width:0;width:100%;padding:13px;border:1px solid #7185a1;background:#091525;color:#fff;border-radius:7px;font:inherit}.home-signin button{min-height:46px;border:0;border-radius:8px;background:#edce8b;color:#091525;font:700 16px system-ui;cursor:pointer}.home-signin a{text-decoration:underline}.home-signin p{line-height:1.6}';document.head.append(style);
 main.className='wrap';main.innerHTML='<section class="home-signin" aria-labelledby="sign-in-heading"><h1 id="sign-in-heading">Sign in</h1><p>Use your En-Route account.</p><form id="member-auth-form" method="post" action="/account/ad-free.html" autocomplete="on"><label>Username<input id="member-username" name="username" autocomplete="username" minlength="3" maxlength="24" required></label><label>Password<input type="password" id="member-password" name="password" autocomplete="current-password" required></label><button type="submit" id="member-check" disabled>Sign in</button></form><div id="member-result" role="status" aria-live="polite"></div><p>New to En-Route? <a href="/register.html">Create an account</a>.</p><p><a id="cancel-home-signin">Cancel</a> · <a href="/privacy.html">Privacy</a></p></section>';
 document.querySelector('#cancel-home-signin').href=back;
 document.title='Sign in | En-Route';
 const auth=document.createElement('script');auth.src='/account/ad-free.js?v=20261125-1';auth.async=false;document.head.append(auth);
})();