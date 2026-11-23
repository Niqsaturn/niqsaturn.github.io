# En-Route: Adsterra integration handoff

Status: **AdSense retired. Adsterra publisher codes NOT YET PROVIDED. No advertising scripts are currently active.**

Live public pages:
- https://niqsaturn.github.io/
- https://niqsaturn.github.io/forum/
- https://niqsaturn.github.io/forum/compose.html (must remain ad-free)

## Reserved, currently hidden Adsterra zones

| Placement | HTML file | Zone marker | Intended format |
|---|---|---|---|
| Homepage after gameplay trailer | `index.html` | `data-adsterra-zone="home-after-trailer"` | Native banner or approved responsive banner |
| Homepage after final download section | `index.html` | `data-adsterra-zone="home-after-download"` | Native banner or responsive banner |
| Forum category overview above navigation | `forum/index.html` | `data-adsterra-zone="forum-above-categories"` | Native banner / responsive banner |
| Forum category overview below content | `forum/index.html` | `data-adsterra-zone="forum-below-categories"` | Native banner |

Each zone contains `[data-adsterra-mount]` and is hidden by default; there should be no blank ad panels when Adsterra is not configured. The forum JS only reveals a zone on the category overview if `data-adsterra-ready="true"` and the zone mount has content. Do not reveal it in topic routes, forum login/composer, account creation/verification, client executable, or game-related localhost HTTP endpoints.

## Next step

In **Adsterra Publisher → Websites**, submit/approve `niqsaturn.github.io`. Add an ad unit for the desired format, then click **GET CODE**. Publisher-generated scripts are zone-specific and should be pasted exactly as issued by Adsterra: do not guess zone hashes, domains, invocation formats, publisher credentials, or API tokens.

Ask the site owner to provide the *public embed snippets only* (not login credentials or private API tokens), and match each one to a placement. For an approved native banner, embed the code **within the page body** in the intended zone mount per Adsterra instructions. For a classic banner, preserve the vendor's exact script and target element. Each public page can use its own ads; avoid inserting scripts twice. If codes require async delivery, test load and resize in Chrome before un-hiding zones. Verify placement and network requests, but do not generate fake impressions or clicks.

Check any Adsterra-specific `ads.txt` authorization string if the publisher dashboard provides it. The previous Google AdSense `ads.txt` entry has been deleted; do not reinstate it unless AdSense is intentionally resumed.

Privacy: review region-specific cookies/consent requirements and Adsterra data collection *before* activating tracking scripts. Keep ad content clearly labeled and separated from download, account signup, and gameplay controls. Do not add popunder/interstitial or auto-redirect formats without explicit user approval.

Documentation: https://adsterra.com/blog/turn-a-profit-with-native-banners/ and https://adsterra.com/blog/how-banner-ads-make-money/
