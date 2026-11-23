# WebsiteRevert — En-Route homepage restoration handoff

**Status: HANDOFF ONLY. Do not implement, revert, deploy, or modify the homepage without a separate instruction from the owner.**

## Request and correction to the previous interpretation

The most recent homepage rewrite went too far. The owner **liked the previous marketing style and stronger presentation**. They asked to remove the game-build/version display and unnecessary **01 / 02 / 03** numbering from the mode descriptions, **not** to strip out the marketing personality, redesign the entire information architecture, or replace the established cinematic presentation with a minimalist editorial layout.

This handoff documents how to bring back the previous presentation **selectively**. The live site must be left as-is for now.

## Repository and exact reference points

- **Live site:** https://niqsaturn.github.io/
- **GitHub Pages source:** `Niqsaturn/niqsaturn.github.io`, branch `main`. Do not confuse this with `Niqsaturn/En-Route` (game assets/prelaunch work).
- **Reference before overcorrection:** commit `3142a773d318d5444d5c31820ef5af62c43198c2`
  - `index.html` blob: `0eb90ec8e458cd857990f59171b115b13ebf663e`
  - `styles.css` blob: `c70930d5505ff6409ca992671c01278b29d39d51`
- **Overcorrection changes to examine:**
  - `22e043629ea0e02c54d5e477d48180f02f32210a` — replaced the previous homepage copy/structure with minimalist wording.
  - `faf51bd779d9134998dfe73aa55dad8acff0daf3` — added `home.css` with the new editorial design.
  - `fb57af5cb6c73b58d335f377618a6157ce22208e` — further adjusted homepage ad spacing.
- The old `styles.css` remains in the live repository and is **shared with the account, forum, and privacy pages**. Any future restoration must avoid changing styles for those pages.

**Do not run `git reset --hard` or revert whole commits blindly.** The old page had things the owner explicitly does *not* want restored: visible build numbers, artificial mode counts, and verbose Windows-release wording. Treat the old commit as a **visual and copy reference**, not an exact rollback target.

## Restore the personality of the copy

Use the previous homepage wording as the main source of truth. These previously established lines were not themselves rejected:

| Area | Preferred pre-overcorrection direction |
| --- | --- |
| Hero headline | **THE BOARD FIGHTS BACK.** |
| Hero eyebrow | **CHESS WITHOUT A SAFE SQUARE** |
| Hero description | “Protect your King when every square can turn against you. Survive a rising siege, build your formation, or command an entire court.” |
| Trailer heading | **TACTICS IN MOTION.** |
| Modes heading | **YOUR PIECES. YOUR KIND OF CHAOS.** |
| Modes lead | “Each mode asks you to think differently: survive the siege, shape an army, or command the court.” |
| Account heading | **YOUR STORY STARTS HERE.** |
| Closing heading | **ENTER THE BOARD.** |

Restore the confident, slightly dramatic writing and short cinematic headlines instead of replacing them with literal utility labels such as “Watch the game in action,” “Pick your battlefield,” or “Create your En-Route account” for every major heading. Marketing copy can have personality **as long as feature descriptions remain accurate**. Preserve the real explanations of survival, faction autobattles, and Pawn-led construction.

Avoid invented promises, inaccurate release claims, or gratuitous “AI-sounding” repetitions. Keep the headline-and-subheading hierarchy instead of crowding sections with extra explanatory paragraphs.

## Restore the stronger *layout*, selectively

1. Recover the prior **hero composition**: deep blue/gold palette, larger display headline, stronger coming-soon presentation, generous vertical rhythm, large **centered** game screenshot, and the framed/chrome treatment if it improves the result. The minimalist rewrite removed too much visual character.
2. Recover the prior **trailer and mode-section presentation**, including the bold stacked headings, decorative typographic contrast, and original three-card layout. Preserve the music-backed trailer and gameplay images without edits.
3. Recover the prior **mode-card visual tags**, but **remove the arbitrary ordering digits**:
   - `01 / SURVIVE` → `SURVIVE`
   - `02 / OUTTHINK` → `OUTTHINK`
   - `03 / COMMAND` → `COMMAND`
   These are mode identities/categories, not a sequence, ranking, or progression system.
4. Consider bringing back the more substantial account and closing sections, with previous design language. Keep actual registration links working and avoid duplicate or misleading calls to action.
5. To restore the former layout, favor using the original markup/classes from `3142a773...` with the retained `styles.css`, then apply **minimal, homepage-scoped overrides**. The recent `home.css` is an optional reference, not a requirement. Do not edit shared selectors in `styles.css` in ways that break registration or forum pages.
6. Do not restore an artificial metric strip with a version number or arbitrary counter. If a feature strip is visually useful, use real game concepts instead of release telemetry or filler statistics.

## Non-negotiable constraints to retain

- **Do not show current game build numbers** in the visible homepage UI. Remove version badges/“current game build” panels. Keep any necessary internal asset provenance in documentation rather than the public pitch.
- **Do not re-add the Windows download link** or restore the old `En-Route-0.2.21.zip` URL. Keep a polished, **non-clickable COMING SOON** announcement. Do not say “WINDOWS RELEASE IN PREPARATION”; it sounded awkward and was explicitly rejected.
- **Do not re-add 01 / 02 / 03** on the game modes. The three cards represent alternatives, not ordered steps.
- Preserve **trailer playback with music**, gameplay screenshots, account registration at `/register.html`, forum at `/forum/`, `/account/ad-free.html`, privacy link, and existing ad-placement logic. Do not introduce new sign-up or backend behavior.
- If the homepage changes, keep file paths and root-relative links correct for the GitHub Pages domain.
- Do not modify game code, launcher, server, account data, ad provider configuration, or media binaries as part of the copy/layout restoration.

## Implementation checklist — for a *future approved* work session

1. Read this handoff and fetch the **latest** `main/index.html`, `styles.css`, and `home.css`. Check for intervening commits first.
2. Diff current `index.html` against `3142a773.../index.html`; take the desired previous wording and markup, not unwanted build labels or broken installer links.
3. Restore character to headings and sections, reinstate the stronger hero/frame/mode presentation, remove ordered numbering and visible build counters, retain clean Coming Soon.
4. Stage the change as a small reviewable diff or branch; **do not merge automatically just because this handoff exists**.
5. Test Chrome desktop (1440×900), tablet (768×1024), mobile (390×844): no horizontal overflow; title/sign/image aligned, complete readable card copy, no broken links/images.
6. Confirm music trailer loads and plays on click, registration/forum/privacy links work, and no download links or build numbers leak into the homepage.
7. Review screenshots side by side with the older presentation and obtain owner approval before publishing another sweeping redesign.

## Definition of done

It should **feel like the original confident En-Route launch site again**, not a generic corporate template, but with the user's specific removals (build labels, mode numbering, unsupported downloads, awkward release text) still honored. No page changes are authorized by this handoff alone.
