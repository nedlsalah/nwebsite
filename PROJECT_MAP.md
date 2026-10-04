# PROJECT_MAP — NEDLSALAH editorial redesign (v5)

[TECH_STACK]
- v7 adds an optional motion layer: GSAP + ScrollTrigger, Lenis, SplitType (self-hosted in `./vendor`, loaded with `defer`) driven by `./js/enhance.js`. Three.js and Swiper are deliberately not used (see [DEPENDENCIES]).
- Static site: one `index.html` (inline CSS + one inline script), no build step, no framework, no runtime dependencies.
- Removed from the original: Font Awesome (CDN), GSAP + ScrollTrigger (CDN), Google Fonts (CDN). Zero third-party requests at runtime.
- Self-hosted fonts in `./fonts` (woff2): Bricolage Grotesque (display, variable), Geist (body, variable), IBM Plex Sans Arabic 400/500/600/700 (Arabic subset, loaded only when Arabic text is rendered).
- Images: `./img/me.jpg` untouched. Added derived `me-640.webp` / `me-1100.webp` (served through `<picture>`; the jpg stays as fallback). Favicons unchanged.
- Native platform features used: IntersectionObserver, CSS scroll-driven animations (progressive enhancement), View Transitions API (progressive), `:has()`, `color-mix()`, logical CSS properties, `inert`.

[DEPENDENCIES]
- GSAP 3.12.7 + ScrollTrigger 3.12.7 (`vendor/gsap.min.js`, `vendor/ScrollTrigger.min.js`) — quickTo-driven pointer motion, scroll-scrubbed statement, marquee timeline/pause, count-ups, layout refresh. Fallback: v5 native layer (CSS + IntersectionObserver). GSAP standard "no-charge" licence (gsap.com/standard-license): fine for a personal portfolio; re-check if the site is ever resold as a product.
- Lenis 1.1.20 (`vendor/lenis.min.js`, MIT) — smooth wheel scrolling only (touch stays native). Anchors, back-to-top and the mobile menu lock are wired to it. Fallback: native scrolling + CSS smooth scroll.
- SplitType 0.3.4 (`vendor/split-type.min.js`, MIT) — word splitting for the About statement (words only, so Arabic letters stay joined). Fallback: plain text.
- All pinned exact versions, self-hosted (no CDN, no third-party requests). Copied unmodified from the npm packages.
- Not used on purpose: Three.js (no 3D idea that justifies ~600 KB), Swiper (no slider), Lucide (6 inline SVGs suffice), GSAP SplitText (licence/availability).

[DESIGN_SYSTEM]
- Type: display `Bricolage Grotesque` 620-650, tight tracking (`-0.045em`); body `Geist`; Arabic `IBM Plex Sans Arabic` with letter-spacing 0 and larger line-height (1.3 headings, 1.9 body). Sizes via `clamp()`.
- Colour (dark): bg `#0d0d0f`, surface `#141417`, text `#f2f0ea`, muted `#9a978f`, accent `#3cc1da`. (light): bg `#f4f1ea`, surface `#fbf9f5`, text `#151513`, muted `#66635b`, accent `#00708b`. Brand teal `#0792b1` is used for the selection colour and the scroll bar only. Accent appears on: active nav number, section indices, role line, availability dot, open-service marker, timeline fill, link hover.
- Shape: no cards, no rounded rectangles; hairline rules (`--line`), pill radius only on buttons.
- Motion curves: `--ease` cubic-bezier(.16,1,.3,1) for entrances, `--ease-io` cubic-bezier(.65,0,.35,1) for clip reveals.
- Spacing: `--pad` clamp(1.25rem,4vw,3.5rem); sections `clamp(5rem,12vw,10rem)`; max width 1440px.

[PAGE_STRUCTURE]
Skip link → scroll progress → nav (brand · numbered links · EN/AR · theme · menu) → Hero → 01 Services → 02 About → 03 Experience → 04 Skills → 05 Credentials → 06 Contact → Footer. Back-to-top button and full-screen mobile menu are fixed overlays.
- Services: 6 items as an accordion index (title, description, 4 detail lines each).
- Experience: 10 items (no dates exist in the source, none were invented), numbered, sticky counter.
- Skills: the original 24 items, grouped by me into 6 rows (Marketing & Growth, Web, Design, Photo & Video, Workflow & AI, Languages). Grouping is presentation only; no skill was added or removed.
- Credentials: 5 items, year + provider + title, taken from the source.

[SYSTEM_FLOW]
1. `<head>` inline script (before first paint): reads `site-theme`, `site-lang`, `site-motion` from localStorage; sets `data-theme`, `lang`/`dir`, and class `fx` (motion on) → no theme/direction flash.
2. Inline script: `i18n` dictionary (original EN/AR strings reused verbatim + 25 new keys) → `setLanguage()` fills `[data-i18n]`, `[data-i18n-html]`, `[data-i18n-aria]`, `[data-i18n-alt]`, title, role-line phrases → `setTheme()`.
3. Motion init only when `fx`. Failsafe: if the script never reaches `window.__ok`, a 3 s timer reveals everything.

[INTERACTION_SYSTEM]
- Nav: transparent at top, blurred surface after 24px scroll; active link from scroll position; numbers and underline wipe.
- Hero: word-mask headline, clip-path portrait reveal, staged `data-intro` items, scroll-linked drift (CSS scroll timeline where supported).
- Services: one row open at a time; click/tap/Enter/Space, or hover on fine pointers with hover-intent (real pointer movement + 140 ms rest, so layout shifts never trigger it).
- Experience: IntersectionObserver marks the active item and drives the counter; vertical line fills with scroll.
- Skills: `:has()` dims siblings on hover. Credentials: row wash on hover.
- Cursor (fine pointers + motion on): ring/dot with states default, link, button, row (contextual label EXPLORE / استكشف), image, text. Magnetic buttons. Disabled on touch and when motion is off.
- Hero portrait pointer response (fine pointers + motion on, only while hero is visible): eased translate ±3% of image width, rotate ±1.2deg (direction flips in RTL), constant scale 1.07 so clipped edges never show. Shares the single rAF loop with the cursor; the loop idles when nothing moves.
- Theme switch: circular View Transition reveal; language switch: View Transition cross-fade.
- Motion switch in footer overrides the OS reduced-motion setting (stored as `site-motion`).

- Motion layer (only when `html.fx`, libraries loaded, no exception): Lenis smooth scroll; services marquee (aria-hidden, reads the six real titles, direction reverses in RTL, speeds up with scroll velocity, pauses off-screen); About statement words scrub from 16% to 100% opacity; real numbers (7+) count up once.
- Pointer layer (fine pointers only, one `pointermove`, one ticker): hero headline words lean toward the cursor (≤16px, distance falloff), accent spotlight follows the cursor in the hero, service titles/arrows, credential titles/years, skill items and the email link are pulled toward the pointer by small eased amounts (`gsap.quickTo`, transform only).
- Language switch rebuilds the marquee and the statement split from the new text (SplitType runs on a detached node because it caches the original HTML per element).

[ACCESSIBILITY]
- Semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1`, ordered headings, skip link, `aria-current` on active nav link.
- Accordion buttons with `aria-expanded` / `aria-controls`; closed panels are `inert`. Mobile menu is `inert` when closed; `main` and footer are `inert` while it is open; Esc closes and returns focus.
- Visible `:focus-visible` outlines; all labels (`aria-label`, image `alt`, document title) switch language.
- `prefers-reduced-motion: reduce` → motion class is not applied: no reveals, no cursor, no typing animation (role phrases shown statically), no transitions.
- Contrast pairs chosen for ≥4.5:1 on body-size text in both themes.

[PERFORMANCE]
- v7 motion layer adds 4 deferred scripts + enhance.js (~153 KB raw, ~58 KB gzipped); they never block first render. Without them the page is the 155 KB v5 page.
- v5 desktop first load: 4 requests, 155 KB (html + 2 fonts + 1 webp). Layout shift measured 0.0.
- Hero image `fetchpriority="high"`, other image lazy; explicit width/height on images.
- Only `transform`/`opacity`/`clip-path`/`translate` animated; one `requestAnimationFrame` loop only while the custom cursor is active; scroll handler throttled with rAF.

[ARCHITECTURE]
- Source of truth lives in `index.html`. Content and links were taken from the original file; the original `i18n` dictionary is reused verbatim.
- New dictionary keys (EN + AR): cur_explore, doc_title, skip, aria_main, aria_lang, aria_light, aria_dark, aria_menu_open, aria_menu_close, aria_top, hero_alt, about_alt, sk_marketing, sk_web, sk_design, sk_content, sk_workflow, sk_languages, motion_label, motion_on, motion_off.
- Dead Font Awesome `<i>` tags left inside CTA strings were removed (9 occurrences). Removed on purpose: side section-dots nav (replaced by numbered nav links), tilt/spotlight card effects, GSAP orbs, Font Awesome icons (replaced by 6 inline SVGs).

[VERIFICATION]
- 33 automated functional checks pass (Chromium via Playwright): theme + language toggle and persistence before paint, RTL, translated title/aria/alt, active nav, back-to-top, progress bar, accordion by hover and keyboard, counts of services/experience/credentials, link integrity (mailto, Behance, 500px, `rel=noopener`), mobile menu open/close/Esc/navigate/inert, no cursor on touch, reduced-motion behaviour and override, skip link and focus outline.
- Layout matrix: 320, 375, 390, 414, 768, 1024, 1280, 1440, 1920 px × EN/AR × dark/light = 36 combinations, no horizontal overflow, no console errors.
- Visual review by screenshots: hero, services, about, experience, contact (EN dark), hero (AR light), mobile hero and menu.
- Browser coverage: Chromium only. Safari and Firefox were not available; scroll-driven animations and View Transitions degrade gracefully (static drift, instant theme switch).
- Arabic copy: all original strings reused. The 20 new UI strings (aria labels, skill-group labels, motion label) were written for this redesign and should be read by a native speaker.

[VERIFICATION ADDENDUM — v7]
- Chromium/Playwright, EN + AR: libraries load; marquee built in the active language and rebuilt after a live language switch; statement re-split in the new language (bug found and fixed: stale SplitType cache); anchor navigation and back-to-top go through Lenis; hero words and spotlight react to the pointer; service/credential pull transforms applied; mobile menu pauses Lenis and a menu link scrolls after close (bug found and fixed: Lenis.start() cancelled the scroll); reduced motion → no marquee, no Lenis; vendor folder removed → page, nav and content fully usable; no console errors; no horizontal overflow. Outlined marquee words were dropped (variable-font contour overlap shows through text-stroke).
- Not tested: Safari/Firefox, real touch devices.

[VERIFICATION ADDENDUM]
- Re-tested after the pointer/cursor additions (Chromium, EN + AR at 1440px): portrait transform follows pointer and mirrors in RTL; row cursor label shows in the active language; none on touch; none with reduced motion; no horizontal overflow; no console errors. The cursor label and the 'Explore' string should be read by a native Arabic speaker with the other 20 new strings.

[ORPHANS & PENDING]
