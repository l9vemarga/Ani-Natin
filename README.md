# Ani Natin website

Info website promoting the SHS TVL Agri-Fishery Arts track. Built with Astro, plain CSS and GSAP, following the Proposal and Tech Stack, the Brand Book and the Design Study (worksheet pages 10 to 15).

## Run it

```bash
npm install
npm run dev      # opens at http://localhost:4321
npm run build    # makes the final site in /dist
```

Needs Node 18.20+ or 20.3+. Deploy on Cloudflare Pages with build command `npm run build` and output directory `dist`.

## Where things are

```
ASSETS.md                          every photo and drawing still needed, with exact file names
public/images/                     drop the photos here (see ASSETS.md)
public/brand/                      logos (traced from the Brand Book, replace with originals)
src/styles/global.css              colors, fonts, pill buttons, base styles
src/styles/fonts.css               how to add the real brand fonts
src/layouts/BaseLayout.astro       page shell
src/components/
  Loader.astro                     loading screen: vines over the wordmark (Home page only)
  SiteHeader.astro                 floating header: icon circle + pill links
  IntroFrames.astro                the three intro screens (food + path, brown ground, farmer photo)
  HomeHero.astro                   hero: cutout photo, wordmark, slogan, one button
  Rationale.astro                  dark green section with pill-shaped photos
  Infographic.astro                "What do you actually do in Agri?": the plant, the vine and its five stations
  VineIcon.astro, VinePlant.astro  the station icons and the plant (stand-in drawings)
  AgriCareers.astro                Agri-career branches: one full screen, three big cards
  ClosingBand.astro                full-bleed photo band with the button
  SiteFooter.astro                 cream footer with vertical navigation
  Photo.astro                      photo slot: shows the file if it exists, else a labeled placeholder
  Scribble.astro                   hand-drawn marks (stand-ins until the real SVGs arrive)
  Logo.astro                       inline logos
  CommunityHero.astro              Community: headline and the big search
  CommunityHub.astro               Community: Testimonials / Discussion Forum tabs, forum, "Ask a question" form
  FaqSection.astro                 Community: FAQ accordion (yellow card)
  SchoolFinder.astro               Community: school locator (list file + Fuse.js)
  NotFoundScene.astro              404 page: the farm scene (farmer, crops, pond), drawn in code
src/pages/index.astro              the Home page
src/pages/community.astro          the Community page
src/pages/404.astro                the 404 page (Cloudflare Pages serves it for any address that does not exist)
src/data/community-content.js      Community text: categories, FAQ, testimonials, sample forum topics
src/data/community.config.js       Community settings (mock or live forum, limits)
src/data/schools.json              the school list (sample entries until the real list is in)
src/scripts/motion.js              shared animation helpers (every page)
src/scripts/forum-api.js           the forum's data layer (sample data now, the real API later)
src/styles/community.css           Community page styles
src/styles/notfound.css            404 page styles
src/scripts/notfound-animations.js 404 motion: crops grow and sway, the farmer digs, clouds, birds, a jumping fish
BACKEND.md                         the forum backend plan: tables, API, rules, go-live checklist
```

## How the layout works

- Desktop (960px and up) is drawn in proportions of a 1440px-wide design, using `--u` (1% of the width, capped at 14.4px). Positions in the CSS are measured from the Design Study mockups.
- On screens wider than 1440px the design stays 1440px wide and is centered. `--gx` (in `global.css`) is the sideways offset that does this; add it to any new left-anchored position (`left: calc(var(--gx) + var(--u) * 10)`).
- Below 960px the pieces stack. The infographic (vine) switches to a list with the vine beside it below 960px.
- The Agri-career section is exactly one screen tall from 640px up. It is drawn on a 1440 x 960 stage that scales to fit the screen height as well as the width (unit `--k` in `AgriCareers.astro`). On phones it stacks.
- Breakpoints: 360 (base), 430 and 960.

## Community page

- Sections, from the wireframe: a hero with one big search, two tall cards that act as tabs (Testimonials and Discussion Forum), the FAQ, and the school locator.
- The forum runs on **sample data** until the backend exists (see BACKEND.md). It is all one setting in `src/data/community.config.js` (`PUBLIC_FORUM_MODE=live` switches to the real API, with no code change). The page only calls the four functions in `src/scripts/forum-api.js`.
- Sample content is marked **Sample** on the page (`showSampleTags`). Replace it before launch (list in ASSETS.md) and set `showSampleTags` to `false`.
- Search (top bar, forum search and school finder) uses Fuse.js in the browser. No server is needed for the FAQ or the school list.
- Posts are saved nowhere in mock mode. A visitor's new post shows only to them, as "waiting for review", just like the real approval step.
- Test it: `npm run build`, `npm run preview`, then open `/community`.

## 404 page

- `/404` (built to `dist/404.html`). A farmer digs and plants while rice, corn, tomatoes, carrots, pineapples, fruit trees and a fishpond grow around him. The message is in `src/pages/404.astro` (Taglish, easy to rewrite).
- The scene is **drawn in code with the brand colors** as stand-in artwork (`NotFoundScene.astro`). Swap it for the team's own illustration when there is one. Every moving piece has a class (`nf-farmer`, `nf-arms`, `nf-crop`, `nf-tree`, `nf-cloud`, `nf-fish`, ...) that `notfound-animations.js` uses.
- Without scripts, with reduced motion, or if the animation cannot start, the full scene shows with the farmer mid-dig. Hovering a plant gives it a small wiggle.
- Test it: `npm run build`, `npm run preview`, then open `/404`.

## Animations

The shared helpers live in `src/scripts/motion.js` (text lines, reveals, boot). `home-animations.js` and `community-animations.js` add what only their page has. GSAP, ScrollTrigger, SplitText, DrawSVG. Smooth, inertial scrolling with Lenis (set up in `motion.js`, tied to ScrollTrigger like on the two26.studio reference). It gives the mouse wheel and trackpad an easing glide, waits while the loading screen is up, is off for reduced motion, and leaves touch screens on their own native scrolling. The Ask dialog and the search dropdown keep normal scrolling. To remove it everywhere, delete the `setupSmoothScroll()` call in `motion.js`.

- **Loading screen:** `Loader.astro` + `src/scripts/loader.js`. The page starts covered by green vines. A carrot-shaped brush writes the Ani Natin wordmark (it follows two zig-zag strokes, one per row of letters, and the letters show wherever it has been), then hops away while vines, leaves, flowers and sparkles grow around the wordmark. Once the page is ready and the animation has played (about 5 seconds, plus a short hold) the vines pull away to alternate sides from the middle row out, and the intro starts animating while they leave (`loader-gate.js` holds the intro's entrance until then). Clicking or pressing a key skips to the end of the writing. The timings are the numbers in the `arrive` timeline in `loader.js`; the carrot, its path and the plants are drawn in `Loader.astro`. It is off for reduced motion and when scripts are off. To use it on another page, pass `loader` to `BaseLayout`.
- **Intro (three screens, then the hero, one continuous scroll):** `IntroFrames.astro` + `setupIntro()` in `home-animations.js`. Screen 1 is cream: the headline rises, the food cluster pops in piece by piece from the bowl, and the brown path draws itself down from it. After that the scroll does everything on one timeline while the stage is held in place (`position: sticky` inside a tall track whose height `setupIntro()` sets): the camera pans down the drawing (the path flows into the brown ground, screen 2), the statements rise in, the farmer photo (screen 3) opens from the bottom-left corner and its text rises, and finally the hero rises over the held photo like a sheet (the photo sinks back and dims, the hero's farmer and text settle). After the hero the page scrolls as usual. Screens 1 and 2 are one drawing (`.story`); on desktop their positions are the layout's, in `--u`, and the food cluster has its own unit `--cu` so it scales down on phones, where each screen fills one phone screen. The scroll length follows the distances, so the pace is the same on every screen. The track's height is also worked out in CSS (`.intro` in `IntroFrames.astro`), so the first paint is already the right size and nothing jumps. With reduced motion, without scripts, or if the animations cannot start, the screens and the hero simply stack.
- **Text:** marked `data-split` in the markup. Lines rise out of masks.
- **Other hooks:** `data-reveal` (fade up), `data-pop` (scale in), `data-clip` (pill photos open), `data-draw` (hand-drawn marks draw themselves).
- **Infographic (the vine follows you):** `Infographic.astro` + `src/scripts/vine-scroll.js`. A long vine grows down the page through five stations. Its drawn length follows your scroll position: the tip sits about two thirds of the way down the screen and eases after you (so it keeps gliding when you stop, and pulls back in when you scroll up). The tip carries a pair of leaves and more leaves sprout along the vine as it passes. Each station (icon badge, label, speech bubble) wakes up when the vine reaches it: the badge pops and rings out, the icon draws itself and fills in, the label and bubble appear, and a part of the icon keeps moving gently (sprout, wheat, fish, arrows). The plant at the top grows when it comes into view. Desktop (960px and up) is one SVG in the 1440px design, traced from the layout; phones and tablets show the stations as a list and the vine is built from where the badges are. To change a station, edit the `stations` list at the top of `Infographic.astro` (text, position, label style). Without scripts, with reduced motion, or if the animation cannot start, the whole vine and every station simply show.
- **Career branches:** the hills rise as the screen arrives (tied to the scroll), the grass tuft pops, and the three cards swing up one after another (`data-card`).
- **Closing band:** slow parallax on the photo.
- **Reduced motion:** if the visitor prefers reduced motion, no animation runs. The intro frames stack and everything is visible. If the animations cannot start within about 4.5 seconds, the page falls back to the same static view.
- **Header colors follow the section:** orange pills and a green icon over light sections, yellow pills and a yellow icon over dark ones. Each section says which it is with `data-nav="light"` or `data-nav="dark"` on its root element (put it on every new section; a section with no tag counts as light). The script is at the bottom of `SiteHeader.astro`: the icon and each pill look at what is under their own center while scrolling, so they change one by one during the intro reveal.
- **Button hover (vines):** `src/scripts/vine-hover.js` runs on every page. Hovering a header link or a `.pill-btn` draws two vines across the button until it fills, and leaves, a flower and a sparkle pop out of the edges. It reverses when the pointer leaves. Mouse and keyboard focus only (touch just navigates), and it is off for reduced motion. The fill and text colors per button are the `--vine-fill` and `--vine-ink` values under "Vine hover" in `global.css`.
- **Only transforms, opacity, clip-path and stroke drawing are animated**, so nothing shifts the layout.

To remove an effect, delete its `data-` attribute from the markup. To change the intro length, edit `end: '+=125%'` in `setupIntro()`.
