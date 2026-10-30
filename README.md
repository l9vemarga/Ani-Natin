# Ani Natin website

Info website promoting the SHS TVL Agri-Fishery Arts track. Built with Astro, plain CSS and GSAP, following the Proposal and Tech Stack, the Brand Book and the Design Study (worksheet pages 10 to 15).

This is the developer guide for the website source code. **For the whole capstone project** (the worksheet and how the site follows it, the proposal, brand book, wireframes, logos, status and what is left to do) see the README one folder up: `../README.md`.

Pages built: Home `/`, Youth in Agri `/youth-in-agri`, Community `/community`, About `/about`, and the 404 page. Not built yet: Contact `/contact` and Privacy `/privacy`.

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
  YouthHero.astro                  Youth in Agri: the lime video block at the top
  YouthIntro.astro                 Youth in Agri: "Agri-Success Stories" and the story diagram
  YouthGreenZone.astro             Youth in Agri: GREEN Zone story (yellow, arch photo) and the sliding photo strip
  YouthVermiTea.astro              Youth in Agri: VermiTea Kit story (green, box, tilted tag) and its text
  YouthMore.astro                  Youth in Agri: "But wait..." expanding frames and the closing question
  AboutHero.astro                  About: headline and the orange sprout
  AboutObjectives.astro            About: orange background paragraph, Project Objectives cards, the hover stage
  AboutMissionVision.astro         About: Mission / Vision tabs, the vegetables, the Partnerships marquee
src/pages/index.astro              the Home page
src/pages/community.astro          the Community page
src/pages/about.astro              the About page
src/pages/youth-in-agri.astro      the Youth in Agri page
src/pages/404.astro                the 404 page (Cloudflare Pages serves it for any address that does not exist)
src/data/community-content.js      Community text: categories, FAQ, testimonials, sample forum topics
src/data/community.config.js       Community settings (mock or live forum, limits)
src/data/schools.json              the school list (sample entries until the real list is in)
src/data/youth-content.js          Youth in Agri text, the diagram, the frames and every photo / video slot
src/styles/youth.css               Youth in Agri page styles
src/scripts/youth.js               Youth in Agri: strip sliding, the opening frames, the diagram's links, YouTube play button
src/scripts/youth-animations.js    Youth in Agri motion: pills, the vine, arch curtain, strip, vegetables and box, frames
src/data/about-content.js          About text: background paragraph, the three objectives (and their stage media), mission, vision
src/styles/about.css               About page styles
src/scripts/about.js               About: card hover / tap swaps the stage, Mission / Vision tabs
src/scripts/about-animations.js    About motion: sprout grows, paragraph highlight, cards swing up, vegetables rise
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

## Phones

Made and checked for phones as well as desktop (Chrome and Safari's engine, WebKit, in iPhone 13, iPhone SE and Pixel 7 sizes).

- **The loading screen plays once per browser session.** Coming back to Home, or reloading it, goes straight to the page. Add `?loader` to the address to see it again. It is also skipped when the visitor asked to save data, and it runs about 25% quicker on phones.
- **Animation work starts only when needed.** Text is split into lines (the slow part) only when it is within one and a half screens, and the vine is measured the first time it nears the screen, so the first paint is not held up.
- **The intro stage uses the large viewport on phones** (`--stage` in `IntroFrames.astro`: `100lvh` on phones, `100svh` on desktop), so the phone browser's collapsing toolbar never leaves a strip under it. The content inside is still laid out for the visible height.
- **Older phones and browsers.** Screen-height units `svh` / `lvh` are not known by iPhones before iOS 15.4 or by Android browsers before about late 2022, and a page that uses them directly loses those heights (the Home intro showed a blank first screen on such a phone). All heights now go through two variables in `global.css`, `--svh` and `--lvh`, which fall back to plain `vh`; never write `100svh` directly in new CSS, use `calc(var(--svh) * 100)`. As a safety net, `startMotion()` in `motion.js` checks that the intro stage really has a height and, if not, switches the page to the simple stacked layout. To test an old browser, rewrite `svh` / `lvh` to an unknown unit in the page (see the idea in `nosvh.mjs`-style tests): the intro must still work.
- **Notches and the home indicator:** `viewport-fit=cover` in `BaseLayout.astro`, with the header and footer padded by `env(safe-area-inset-*)`.
- **Tap size:** buttons and menu pills are at least 44px tall.
- **Weight:** the CSS is inside each page (no extra request that blocks the first paint, `astro.config.mjs`), only the display stand-in font is loaded as a fallback (the others use the phone's own font), and the big photos have smaller copies for small screens (`-640`, `-960`, `-720`, `-1080` and `-320` files next to the originals, chosen with `srcset` in `Photo.astro`). **If you replace one of those photos, make its smaller copies again.**
- **Smooth scrolling is desktop only.** Lenis (the eased mouse wheel / trackpad scrolling, `setupSmoothScroll()` in `motion.js`) and the eased jumps to a section (`scroll-behavior: smooth` in `global.css`, the smooth `scrollIntoView` calls in `community.js`) only run on a desktop: a screen at least 960px wide with a mouse or trackpad (`isDesktopPointer()` in `motion.js`, `(hover: hover) and (pointer: fine)`). Phones and iPads, including a big iPad in landscape, keep plain native scrolling, because the eased scrolling made the page misbehave there.
- **Accessible orange:** headlines in orange on cream use `--orange-ink` (3.1 to 1) and small orange text `--orange-ink-sm` (4.5 to 1), both a little deeper than the brand orange (see `global.css`). The nav pills and footer keep the exact brand orange, as in the mockups.

## Community page

- Sections, from the wireframe: a hero with one big search, two tall cards that act as tabs (Testimonials and Discussion Forum), the FAQ, and the school locator.
- The forum runs on **sample data** until the backend exists (see BACKEND.md). It is all one setting in `src/data/community.config.js` (`PUBLIC_FORUM_MODE=live` switches to the real API, with no code change). The page only calls the four functions in `src/scripts/forum-api.js`.
- Sample content is marked **Sample** on the page (`showSampleTags`). Replace it before launch (list in ASSETS.md) and set `showSampleTags` to `false`.
- Search (top bar, forum search and school finder) uses Fuse.js in the browser. No server is needed for the FAQ or the school list.
- Posts are saved nowhere in mock mode. A visitor's new post shows only to them, as "waiting for review", just like the real approval step.
- Test it: `npm run build`, `npm run preview`, then open `/community`.

## About page

- `/about`, from the About design: a cream hero ("Para saan nga ba ang Ani Natin?") with an orange sprout that grows out of the orange band (dome, three arcs, a dot); the orange background paragraph, which **lights up letter by letter as you scroll** (same effect as the Home intro, `text-highlight.js`); the yellow **Project Objectives** with three arch cards over lime; dark green **Mission / Vision**; a row of vegetables; and the yellow **Partnerships** marquee. The words are in `src/data/about-content.js`.
- **Objectives stage.** Hovering a card (or focusing its tab with the keyboard, or tapping it on a phone) swaps what the lime stage under the cards shows: a video or image for that objective. The files do not exist yet, so each shows a labeled placeholder ("Needs: ..."). Add `public/images/about/objective-inform.webp` (and/or `public/videos/about/objective-inform.mp4`), `objective-provide.webp`, `objective-create.webp` and they are used with no code change (a video plays while shown, muted). See ASSETS.md.
- **Mission / Vision.** Two overlapping tilted tabs, as in the design (Mission in front). Clicking Vision (or the arrow keys) brings it forward and fades its statement in. The vision text is from the worksheet; the design only showed the mission.
- **Partnerships** is only the word on a slow marquee, as in the design (no partner logos yet: permission from 4-H, SEED Philippines and DA-ATI is still pending). The marquee is CSS (`ab-marquee`, 46s per loop in `about.css`); it stops for reduced motion.
- Headings use **Garet Heavy**, which matches the design (the Home headings use Magic Yellow). On screens wider than 1440px the vegetable row carries on to both sides.
- Test it: `npm run build`, `npm run preview`, then open `/about`.

## Youth in Agri page

- `/youth-in-agri`, from the final Youth in Agri design: a lime **video block**; the orange headline **Agri-Success Stories** with the story diagram (CNHS: GREEN Zone, VERMI Kit; Young Pioneers: 4-H Club, SEED PH, DA-ATI); the yellow **GREEN Zone** story with an arch photo and a **strip of photos you can slide** (drag, scroll, arrows, or swipe); the green **VermiTea Kit** story (the kit's box hangs down over the edge, with a tilted "VermiTea / Kit" tag, flat vegetables behind it, and the story in two columns under it); **"But wait... There's more!" as expanding frames** (the three partner stories); and the closing question with the button to the Community page. Everything is in `src/data/youth-content.js`.
- **Expanding frames** ("But wait... There's more!"). Desktop: 4-H is open first (the big frame: photo, headline beside it, text under), SEED is the tall frame next to it and DA-ATI peeks out behind that one, as in the wireframe. Press a tall frame: it grows, and the open one folds into a tall frame, so there is always one open. The slots (open / next / peek) are set by `setupFrames()` in `youth.js` and drawn in `youth.css` (`data-slot`). The frames hang half over a lime part below, which holds the closing question and the **Proceed to Student Forum** button. Phones: they stack as an **accordion** (a number, the name and headline; open to the photo and text; pressing the open row closes it). They are real buttons (`aria-expanded`), so the keyboard works, and the diagram's partner pills open their frame and scroll to it. **Smoothness:** on desktop each frame is a box whose width slides (plain numbers, eased in and out, `--move` / `--ease` on `.yt-frames` in `youth.css`) with two fixed-size layers pinned to its left edge, the open one (photo, headline, text) and the tall one (photo, number, name, headline, +). They cross-fade as the box grows or shrinks, so text never re-wraps and nothing jumps; `contain: layout paint` keeps the page from re-measuring. To change the speed, edit `--move`.
- **The story diagram is a vine.** Only the two green pills show at first, each with a small sprout hanging under it. Hover one (mouse), or press / tap it (touch and keyboard): a vine drops from the pill, reaches out to each story, a bud pops at its tip (with a ring) and stretches into an orange button, then leaves and a curling tendril unfold around it. Moving away pulls it back in (the same timeline played backwards); pressing the pill while hovering pins it open, pressing again (or Escape, or pressing elsewhere) closes it. The vine is an SVG drawn in the diagram's own unit (`--tu`) in `YouthIntro.astro`; the state (`aria-expanded`) is `setupTree()` in `youth.js`, and the animation is `setupTree()` in `youth-animations.js` (**to change the pace, edit `rowAt()`, the time between buttons, and the durations there**). On phones a group opens by tapping and the buttons take room only while open. With reduced motion (or without scripts) the whole diagram is simply open and static. The design shows "Article 1 / 2 / 3" under Young Pioneers; they are labeled with the three partners from the worksheet instead, and each opens its accordion row.
- **Video block.** Add `public/videos/youth/feature.mp4` (a poster image `images/youth/feature-poster.webp` is optional) and it is shown with the browser's own play controls. Or set `youtubeId` in `youth-content.js`: the video loads only when the visitor presses play. Until then it shows a labeled placeholder.
- **Photos.** Every photo (the arch, the five strip photos, the kit box, the three accordion photos) is a slot that shows "Needs: images/youth/..." until its file exists (list in ASSETS.md). The VermiTea box is meant to be a transparent cut-out (PNG or WebP); the flat vegetables behind it are drawn in code.
- Headings are Etna Sans Serif with a hair of outline (the design's are a little heavier than Etna's one weight), and pills are Garet Heavy.
- Test it: `npm run build`, `npm run preview`, then open `/youth-in-agri`.

## 404 page

- `/404` (built to `dist/404.html`). A farmer digs and plants while rice, corn, tomatoes, carrots, pineapples, fruit trees and a fishpond grow around him. The message is in `src/pages/404.astro` (Taglish, easy to rewrite).
- The scene is **drawn in code with the brand colors** as stand-in artwork (`NotFoundScene.astro`). Swap it for the team's own illustration when there is one. Every moving piece has a class (`nf-farmer`, `nf-arms`, `nf-crop`, `nf-tree`, `nf-cloud`, `nf-fish`, ...) that `notfound-animations.js` uses.
- Without scripts, with reduced motion, or if the animation cannot start, the full scene shows with the farmer mid-dig. Hovering a plant gives it a small wiggle.
- Test it: `npm run build`, `npm run preview`, then open `/404`.

## Animations

The shared helpers live in `src/scripts/motion.js` (text lines, reveals, boot). `home-animations.js` and `community-animations.js` add what only their page has. GSAP, ScrollTrigger, SplitText, DrawSVG. Smooth, inertial scrolling with Lenis (set up in `motion.js`, tied to ScrollTrigger like on the two26.studio reference). It gives the mouse wheel and trackpad an easing glide, but **only on a desktop** (a screen at least 960px wide with a mouse or trackpad: `isDesktopPointer()`); phones and iPads keep plain native scrolling. It waits while the loading screen is up and is off for reduced motion. The Ask dialog and the search dropdown keep normal scrolling. To remove it everywhere, delete the `setupSmoothScroll()` call in `motion.js`.

- **Loading screen:** `Loader.astro` + `src/scripts/loader.js`. The page starts covered by green vines. A carrot-shaped brush writes the Ani Natin wordmark (it follows two zig-zag strokes, one per row of letters, and the letters show wherever it has been), then hops away while vines, leaves, flowers and sparkles grow around the wordmark. Once the page is ready and the animation has played (about 5 seconds, plus a short hold) the vines pull away to alternate sides from the middle row out, and the intro starts animating while they leave (`loader-gate.js` holds the intro's entrance until then). Clicking or pressing a key skips to the end of the writing. The timings are the numbers in the `arrive` timeline in `loader.js`; the carrot, its path and the plants are drawn in `Loader.astro`. It is off for reduced motion and when scripts are off. To use it on another page, pass `loader` to `BaseLayout`.
- **Intro (three screens, then the hero, one continuous scroll):** `IntroFrames.astro` + `setupIntro()` in `home-animations.js`. Screen 1 is cream: the headline rises, the food cluster pops in piece by piece from the bowl, and the brown path starts to grow out from under the bowl. From then on the path **follows the scroll** (`src/scripts/story-ribbon.js`): its tip stays about 85% of the way down the screen, so it grows down the page as you scroll and pulls back in as you scroll up. On desktop it is part of the big drawing (a mask reveals the brown shape); on phones and iPad portrait it is built from where things sit on the page (from the bowl, down the left side clear of the text, into the brown panel). The two brown-ground statements ("Every ingredient we love..." and "Pero tumatanda...") use a **scroll highlight like two26.studio** (`src/scripts/text-highlight.js`): the text is there but faded, and as you scroll a sweep runs through it letter by letter; letters behind the sweep go solid, the few at its edge glow orange (yellow on the orange block), and scrolling back up un-highlights them. To use it on another text: `createHighlight(element).apply(0..1)` from a scrubbed tween. **To change how slow it is, edit `--read-slow` on `.intro` in `IntroFrames.astro`** (1 = quick, 2.5 = slow (now), 4 = very slow); the scroll length and the photo and hero timing follow it. After that the scroll does everything on one timeline while the stage is held in place (`position: sticky` inside a tall track whose height `setupIntro()` sets): the camera pans down the drawing (the path flows into the brown ground, screen 2), the statements rise in, the farmer photo (screen 3) opens from the bottom-left corner and its text rises, and finally the hero rises over the held photo like a sheet (the photo sinks back and dims, the hero's farmer and text settle). After the hero the page scrolls as usual. Screens 1 and 2 are one drawing (`.story`); on desktop their positions are the layout's, in `--u`, and the food cluster has its own unit `--cu` so it scales down on phones, where each screen fills one phone screen. The scroll length follows the distances, so the pace is the same on every screen. The track's height is also worked out in CSS (`.intro` in `IntroFrames.astro`), so the first paint is already the right size and nothing jumps. With reduced motion, without scripts, or if the animations cannot start, the screens and the hero simply stack.
- **Text:** marked `data-split` in the markup. Lines rise out of masks.
- **Other hooks:** `data-reveal` (fade up), `data-pop` (scale in), `data-clip` (pill photos open), `data-draw` (hand-drawn marks draw themselves).
- **Infographic (the vine follows you):** `Infographic.astro` + `src/scripts/vine-scroll.js`. A long vine grows down the page through five stations. Its drawn length follows your scroll position: the tip sits about two thirds of the way down the screen and eases after you (so it keeps gliding when you stop, and pulls back in when you scroll up). The tip carries a pair of leaves and more leaves sprout along the vine as it passes. Each station (icon badge, label, speech bubble) wakes up when the vine reaches it: the badge pops and rings out, the icon draws itself and fills in, the label and bubble appear, and a part of the icon keeps moving gently (sprout, wheat, fish, arrows). **To change the vine's speed, edit `VINE_LAG` and `VINE_TIP_AT` at the top of `vine-scroll.js`** (lower `VINE_LAG` = the vine trails further behind your scroll and glides longer). The plant at the top grows when it comes into view. Desktop (960px and up) is one SVG in the 1440px design, traced from the layout; phones and tablets show the stations as a list and the vine is built from where the badges are. To change a station, edit the `stations` list at the top of `Infographic.astro` (text, position, label style). Without scripts, with reduced motion, or if the animation cannot start, the whole vine and every station simply show.
- **Career branches:** the hills rise as the screen arrives (tied to the scroll), the grass tuft pops, and the three cards swing up one after another (`data-card`).
- **Closing band:** slow parallax on the photo.
- **Reduced motion:** if the visitor prefers reduced motion, no animation runs. The intro frames stack and everything is visible. If the animations cannot start within about 4.5 seconds, the page falls back to the same static view.
- **Header colors follow the section:** orange pills and a green icon over light sections, yellow pills and a yellow icon over dark ones. Each section says which it is with `data-nav="light"` or `data-nav="dark"` on its root element (put it on every new section; a section with no tag counts as light). The script is at the bottom of `SiteHeader.astro`: the icon and each pill look at what is under their own center while scrolling, so they change one by one during the intro reveal.
- **Button hover (vines):** `src/scripts/vine-hover.js` runs on every page. Hovering a header link or a `.pill-btn` draws two vines across the button until it fills, and leaves, a flower and a sparkle pop out of the edges. It reverses when the pointer leaves. Mouse and keyboard focus only (touch just navigates), and it is off for reduced motion. The fill and text colors per button are the `--vine-fill` and `--vine-ink` values under "Vine hover" in `global.css`.
- **Only transforms, opacity, clip-path and stroke drawing are animated**, so nothing shifts the layout.

To remove an effect, delete its `data-` attribute from the markup. To change the intro length, edit `end: '+=125%'` in `setupIntro()`.
