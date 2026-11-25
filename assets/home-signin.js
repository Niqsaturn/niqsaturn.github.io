(() => {
 'use strict';
 const query=new URLSearchParams(location.search);
 if(query.get('signin')!=='1')return;
 const target=new URL('/account/ad-free.html',location.origin);
 if(query.get('return')==='/forum/')target.searchParams.set('return','/forum/');
 if(query.get('forgot')==='1')target.searchParams.set('forgot','1');
 location.replace(target.pathname+target.search);
})();