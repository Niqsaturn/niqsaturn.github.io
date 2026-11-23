# En-Route HTTPS website + account/forum gateway (staged, not deployed)

**Current production blocker:** `niqsaturn.github.io` calls
`https://en-route.ringtail-anoles.ts.net:8443/enroute-account/api/...`.
The API hostname resolves to `100.88.169.51` through public DNS.
Chromium regards that as a local-network target and prompts or blocks visitors.
Adding an HTML iframe, changing fetch syntax, or changing CORS headers
does not fix the private-address-space restriction.

## Production topology

`Visitor -> HTTPS Cloudflare Pages (static HTML/CSS/JS) -> /api/* Pages Function
-> Cloudflare Access service-token request -> named Tunnel public HTTPS hostname
-> isolated En-Route account/forum service -> MariaDB`

Every visitor sees a normal public HTTPS origin; no browser requests
Tailscale or the computer's loopback/LAN address. Server secrets live
in Cloudflare environment bindings, **never** in the public repository.
Authentication, rate limits, password hashing, input validation,
forum moderation, and paid entitlements still belong to the backend.

## Deployment requirements — not fulfilled by committing this branch

1. Create or authorize a Cloudflare account and a controlled domain; set up
   a named Cloudflare Tunnel for the existing account server, not a temporary
   `trycloudflare.com` hostname. Confirm which service port and host are intended.
2. Protect the public tunnel hostname with **Cloudflare Access** using a
   service-token-only policy. The public browser must not be able to bypass
   the Pages Function and call the origin directly.
3. Connect this GitHub repository to Cloudflare Pages on a review deployment.
   `functions/api/[[path]].js` and `_routes.json` serve only `/api/*`;
   static assets continue to be CDN-cached as usual.
4. Set Cloudflare environment **secrets**:
   - `ENROUTE_UPSTREAM_ORIGIN=https://<Access-protected-origin>/enroute-account/api`
   - `CF_ACCESS_CLIENT_ID`
   - `CF_ACCESS_CLIENT_SECRET`
   Do not paste credentials or tunnel IDs into GitHub commits or chat logs.
5. Verify the Accounts API understands the new server-to-server connection,
   enforce its own authentication and rate limits, and test all allowlisted
   routes with an isolated account. Prove invalid tokens, Origin/CORS, failed
   receipts, replayed auth and oversized requests are rejected.
6. Preview the site on its `*.pages.dev` HTTPS origin. The included
   `assets/api-runtime.js` switches all public account/forum consumers to
   the same-origin `/api`. For a future custom domain, add
   `data-enroute-api="same-origin"` to the root HTML before the cutover.
7. Repeat public-network tests from a non-Tailscale browser: registration,
   verification email, forum category/topic reads, authenticated publishing,
   Royal Pass ad suppression, and no Local Network Access permission prompts.
8. After explicit release approval, direct the website's public DNS to
   Cloudflare Pages and remove legacy GitHub Pages links. Keep the old API
   endpoint private and monitor errors, abuse and cache headers.

**GitHub Pages cannot execute Pages Functions.** This branch deliberately
does not switch production `niqsaturn.github.io` to `/api` before a working
public HTTPS gateway exists. No tunnel, DNS, provider account or payments
were changed by this review branch.

## Membership, advertising and gameplay

Signing in with an existing game account automatically requests the active
Royal Pass entitlement. A short-lived ad-suppression receipt permits the
website/forum to suppress ads without saving a password or account bearer
token. There is no separate "Verify My Membership" workflow. A browser
cannot know the game account's subscription before that browser has an
authenticated identity; after proof expires, reauthentication or a
secure same-origin account session is needed. The backend must issue proofs
only for real active entitlements.

Website placement plan: one responsive banner after the gameplay trailer,
one after the download/account section, one around the forum category
overview and one forum-native unit below categories. No third-party scripts
on login, registration, compose, paid checkout, password recovery, forum
topics or native gameplay. Reserve placement dimensions, hide genuine
no-fill rather than counting a loaded JS tag as an ad impression, and avoid
covering chessboards, controls, navigation or system permission dialogs.

Comparable patterns: Chess.com removes third-party ads for paid members;
Google AdSense recommends responsive ads, measured page fold, unobstructed
content and high viewability. Sources:
- https://www.chess.com/legal/faqs
- https://support.google.com/adsense/answer/6219980
- https://support.google.com/adsense/answer/1282097
- https://developers.google.com/publisher-tag/guides/minimize-layout-shift

**Creative fill is controlled by the publisher network**, its approval,
inventory, blockers, geography and ads.txt configuration. No implementation
can honestly guarantee paid impressions. Obtain any required ads.txt lines
from the actual provider dashboard, never fabricate them, and monitor fill
and viewability with genuine consented analytics rather than synthetic
clicks/impressions.

**Native desktop interstitials remain disabled** pending a publisher-approved
Electron/Windows ad provider, local law/policy review and native SDK
integration. Website ad scripts are not a safe substitute. Once approved,
show only dismissible natural-break interstitials after verified matches,
with strict frequency caps, no PvP/puzzle interruption, and automatic
Royal Pass exemption based on authenticated entitlements.
