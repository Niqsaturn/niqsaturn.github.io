/* One API endpoint for every website feature. On Cloudflare Pages this is
 * same-origin and uses the Access-protected Pages Function gateway.
 * GitHub Pages stays on the legacy endpoint until a public gateway is deployed.
 */
(() => {
 'use strict';
 const edge=location.hostname.endsWith('.pages.dev')||
  document.documentElement.dataset.enrouteApi==='same-origin';
 const root=edge?location.origin+'/api':
  'https://en-route.ringtail-anoles.ts.net:8443/enroute-account/api';
 Object.defineProperty(window,'EnRouteApiRoot',{value:root,writable:false,configurable:false});
})();