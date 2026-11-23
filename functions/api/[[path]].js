/**
 * Cloudflare Pages Functions gateway; this does not execute on GitHub Pages.
 * Serve static content from Pages and the account/forum API from one HTTPS origin.
 * Required Secrets: ENROUTE_UPSTREAM_ORIGIN, CF_ACCESS_CLIENT_ID,
 * CF_ACCESS_CLIENT_SECRET. Upstream must be an Access-protected public tunnel.
 */
const PUBLIC_GET=[
 /^\/forum\/categories$/,
 /^\/forum\/topics$/,
 /^\/forum\/topics\/[1-9][0-9]{0,7}$/
];
const AUTH_GET=[/^\/ads\/status$/];
const JSON_POST=[
 /^\/auth\/login$/,
 /^\/auth\/register$/,
 /^\/auth\/verify$/,
 /^\/auth\/register\/resend$/,
 /^\/ads\/verify$/,
 /^\/forum\/topics$/,
 /^\/forum\/topics\/[1-9][0-9]{0,7}\/replies$/,
 /^\/forum\/reports$/
];
const MAX_BODY=65536;
const json=(status,message)=>new Response(JSON.stringify({error:message}),{
 status,headers:{'Content-Type':'application/json; charset=utf-8',
 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
});
function permitted(path,method){
 const list=method==='GET'?[...PUBLIC_GET,...AUTH_GET]:method==='POST'?JSON_POST:[];
 return list.some(re=>re.test(path));
}
async function boundedBody(request){
 const len=Number(request.headers.get('Content-Length')||0);
 if(len>MAX_BODY)throw new Error('BODY_TOO_LARGE');
 const reader=request.body?.getReader();
 if(!reader)return null;
 const chunks=[];let size=0;
 try{
  while(true){
   const {done,value}=await reader.read();
   if(done)break;
   size+=value.byteLength;
   if(size>MAX_BODY)throw new Error('BODY_TOO_LARGE');
   chunks.push(value);
  }
 }finally{reader.releaseLock();}
 const body=new Uint8Array(size);let cursor=0;
 for(const chunk of chunks){body.set(chunk,cursor);cursor+=chunk.length;}
 return body;
}
export async function onRequest({request,env,params}){
 const method=request.method.toUpperCase();
 const route=Array.isArray(params.path)?params.path:typeof params.path==='string'?[params.path]:[];
 if(!route.length||route.some(part=>!(/^[a-z0-9-]{1,32}$/.test(part))))
  return json(404,'Unknown API route');
 const path='/'+route.join('/');
 if(!permitted(path,method))return json(405,'Unsupported API operation');
 const upstreamOrigin=env.ENROUTE_UPSTREAM_ORIGIN;
 if(typeof upstreamOrigin!=='string'||!upstreamOrigin||
    !env.CF_ACCESS_CLIENT_ID||!env.CF_ACCESS_CLIENT_SECRET)
  return json(503,'Account service gateway is not configured');
 let origin;
 try{origin=new URL(upstreamOrigin);}catch{return json(503,'Account service gateway is not configured');}
 if(origin.protocol!=='https:'||origin.username||origin.password||origin.search||origin.hash||
    !/\/(?:enroute-account\/)?api\/?$/.test(origin.pathname)||
    origin.hostname.endsWith('.ts.net')||
    /^(?:localhost|127\.|10\.|100\.|192\.168\.)/.test(origin.hostname))
  return json(503,'Account service gateway requires a public HTTPS origin');
 const source=new URL(request.url);
 if(source.search.length>1024)return json(400,'Query too long');
 if(method==='POST'&&!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type')||''))
  return json(415,'JSON required');
 let body=null;
 try{if(method==='POST')body=await boundedBody(request);}
 catch{return json(413,'Request too large');}
 const target=new URL(origin.toString().replace(/\/$/,'')+path+source.search);
 const headers=new Headers({
  'Accept':'application/json',
  'CF-Access-Client-Id':env.CF_ACCESS_CLIENT_ID,
  'CF-Access-Client-Secret':env.CF_ACCESS_CLIENT_SECRET
 });
 if(method==='POST')headers.set('Content-Type','application/json');
 const token=request.headers.get('Authorization');
 if(token&&/^Bearer [A-Za-z0-9_-]{43}$/.test(token))headers.set('Authorization',token);
 try{
  const response=await fetch(target,{method,headers,body,redirect:'manual'});
  if(response.status>=300&&response.status<400)return json(502,'Unexpected upstream redirect');
  const safeHeaders=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
   'Referrer-Policy':'no-referrer','Content-Type':'application/json; charset=utf-8'});
  return new Response(response.body,{status:response.status,headers:safeHeaders});
 }catch{return json(502,'Account service temporarily unavailable');}
}
