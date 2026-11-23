# En-Route Adsterra and Royal Pass Ad-Free Integration

**Updated: 2026-11-22.** The public website and forum now mount selected Adsterra banner/native scripts for visitors without a valid ad-free verification receipt. Adsterra creative fill, approval, paid impressions and revenue were **not** verified; browser QA intercepted vendor requests deliberately.

## Site pages and privacy boundary

- Public homepage: https://niqsaturn.github.io/
- Public forum overview: https://niqsaturn.github.io/forum/
- Secure registration, **no third-party ad scripts**: https://niqsaturn.github.io/register.html
- Secure ad-free Royal Pass verification, **no third-party ad scripts**: https://niqsaturn.github.io/account/ad-free.html
- Secure forum topic/reply/report creation, **no third-party ad scripts**: https://niqsaturn.github.io/forum/compose.html
- Native Windows executable: **no Adsterra JS SDK**. Only a native account bridge for read-only entitlements is staged.

The signup form was deliberately moved off the advertising homepage. Forum topics are ad-free; the Adsterra forum placements only activate on the forum categories overview. In-app game scripts and the launcher never include these website ad snippets.

## Active website ad placements

| Placement identifier | Desktop | Mobile |
| --- | --- | --- |
| `home-after-trailer` | 728×90 banner, `fb798cb17bbebdd528f06289b3032e4f` | 320×50 banner, `4865dab6a42861a675c208bd9ca29990` |
| `home-after-download` | 468×60 banner, `a0261380ef2e82bd8c4b5a434343b60e` | Hidden to avoid horizontal overflow |
| `forum-above-categories` | 300×250 banner, `0110caa50cdb0e60674a5e3e367fd539` | Same 300×250 |
| `forum-below-categories` | Native banner container `container-be1a8a1c143387189d74d1320ee44168`, script `https://bellnewyork.org/21/be1a8a1c143387189d74d1320ee44168` | Same native placement |

Banners load from user-supplied `https://bellnewyork.org/22/<key>`. The supplied global script from accountut.com, the `/14/` script, the `ardance.org` direct link and 160×300/160×600 alternatives are intentionally **not deployed**; their formats are either unspecified or less suited to the site's nonintrusive design. The homepage uses **only two placements**, the forum overview uses **only two**. No popunder, Social Bar, Smartlink, overlay, redirects or auto-click methods were intentionally added.

The JavaScript source is `assets/ad-manager.js`, loaded after DOM parsing. It serializes classic scripts so each unit receives its correct `atOptions`; the forum calls the loader only after category data has loaded. Ads may be blocked by browsers or never fill depending on vendor inventory and settings. Do not claim an impression was served without Adsterra publisher evidence.

## Server-authoritative entitlement model

The production account server supports:

- `GET https://en-route.ringtail-anoles.ts.net:8443/enroute-account/api/ads/status`, requiring a live Bearer game session. It reads `account_paid_entitlements` for an **active monthly membership that has started and has not expired**, including qualifying gifted monthly time.
- `POST https://en-route.ringtail-anoles.ts.net:8443/enroute-account/api/ads/verify`, accepting a bounded signed receipt; it **cannot** authenticate a game account or grant game entitlements.

A valid paid account receives a time-limited HMAC proof used **only to suppress website/forum ad loading**. It is kept in `localStorage` as `enroute-ad-free-receipt-v1` so the token never needs to be stored on ad-bearing pages. The issuer uses a private account-service signing key, and the verifier never accepts a forged, tampered or expired proof. If a stored receipt cannot be verified due to a network failure, ad loading fails closed.

A member can visit `account/ad-free.html` to verify their existing game account. Forum posting also calls the same entitlement status after a successful game-account sign-in. The password and account Bearer token are kept in memory only on the **ad-free credential pages**; no third-party advertising scripts are present there. A premium user must verify separately in each browser because an Electron session and a static GitHub Pages tab do not share credentials.

**Current production limitation:** There is NO `account_paid_entitlements` table yet. The account API therefore returns `billingReady:false, adFree:false`; the site does **not** invent a subscription or charge. Stripe billing, webhooks, signed receipt restoration and schema migration from the staged Account directory remain a production gate. The publisher has no verified paying subscribers on this account infrastructure.

## Desktop game

- `Native/account-host.cjs` and `Native/preload.cjs` expose a read-only `adEntitlement()` bridge to the **native game scope only**, verified against the current login session.
- `Game/src/nativeAdDecision.mjs` makes subscription / no-network / online gating explicit; premium disables ads. The current account bridge says `nativeAdvertisingApproved:false` until the ad network approves native Electron placement.
- `Game/src/membershipUI.ts` can display a verified active Royal Pass despite other progression/billing integrations being unavailable.
- No desktop ad service is active; do **not** copy Adsterra website tags into the Electron app.
- The staged game passed 270/270 existing tests, 4/4 native ad tests, TypeScript checks, and production build. Native/www was synchronized with all 36 build files; rollback copy stored under QA. The current public Windows download is **still 0.2.21**; do not claim subscription entitlement changes are in a published client until signed package QA and update publication are completed.

## QA evidence

- `D:\En-Route\WebsiteService-20261122\DeepGameAudit-20261122\adsterra-premium-site-qa.json`: 390px and 1280px, free visitor script placement and simulated premium script suppression, vendor requests intercepted.
- `D:\En-Route\WebsiteService-20261122\DeepGameAudit-20261122\adfree-website-login-flow-qa.cjs`: simulated premium sign-in, proof stored and homepage ad-suppressed, no advertiser requests.
- `D:\En-Route\WebsiteService-20261122\DeepGameAudit-20261122\forum-premium-login-qa.cjs`: simulated forum login → entitlement status → post, no ads.
- Account ad entitlement unit tests: 10/10 PASS.
- Live API `/api/ads/verify`: HTTP 200 for invalid receipt with `adFree:false`; status GET without session: HTTP 401. Account / owner / feedback service health endpoints remain healthy.

## Remaining operator tasks

1. Set up and verify the production Stripe account, exact product/price identifiers, webhook signatures and billing schema migrations through the authorized owner-controlled deployment path. Never grant ad-free from a client-side flag or an unverified checkout success URL.
2. Obtain Adsterra's confirmation of permitted **native game** placement or choose a dedicated native ad SDK. Until then the in-game client remains free of third-party ad scripts and advertising.
3. Review Adsterra creative quality, redirects, cookie/consent obligations and publisher dashboard revenue statistics. Test real creative fill as an ordinary human visitor; do not generate synthetic impressions or clicks.
4. Verify account service startup/recovery (currently Companion `autostart:false`), recurring backups, and public billing readiness.
5. Obtain any Adsterra-required `ads.txt` seller record directly from the publisher dashboard. Do not invent an authorization line.
