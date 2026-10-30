# Assets needed for the Home page

Every slot below shows a labeled placeholder ("Needs: images/...") until the file exists.
Put the file in `public/images/` using the exact name and folder, then refresh. No code change needed.

Sizes follow the web checklist: content images under 200 KB, background images under 300 KB.
Use WebP or JPG for photos, PNG (transparent) for cutouts, SVG for line art.

## Photos (status)

Every slot shows a labeled placeholder ("Needs: images/...") until its file exists. The files below are WebP.
The supplied PNGs were converted: baked-in white corners and white backgrounds were made transparent
(originals untouched, kept outside the site folder), and the images are smaller as a result.

| File (in `public/images/`) | Section | Status |
|---|---|---|
| `intro/farmer-field.webp` | Intro, screen 3 | In (as supplied, 1368 x 834) |
| `intro/farmer-lineart.webp` | (not used now) | The old intro frame 1 drawing. Replaced by the food cluster below; safe to delete |
| `intro/food-bokchoy.webp`, `food-fish.webp`, `food-lettuce.webp`, `food-rice.webp` | Intro, screen 1 (food cluster) | In. White backgrounds removed from the supplied pictures (about 200 to 310 px wide), so they are a little soft on sharp screens. Transparent PNGs or SVGs at 2x would be crisper |
| `home/farmer-cutout.webp` | Home hero | In: the smiling farmer with mangoes |
| `home/farmer-cutout-2.webp` | Home hero, lower left | In: the black and white bending farmer (shown mirrored and cropped at the bottom, like the layout) |
| `home/rationale-photo-1.webp` | Rationale, top pill | In |
| `home/rationale-photo-2.webp` | Rationale, bottom pill | In |
| `infographic/produce-crate.webp` | (not used now) | The old infographic photo. The new design has no photo there. Safe to delete |
| `infographic/career-aquaculture.webp` | Career card 2 | In (the crate photo, trimmed to remove its rounded corners) |
| `closing/field-tractor.webp` | Closing photo band | In (as supplied, 1366 x 751) |
| `infographic/career-agri-tech.webp` | Career card 1 | In (the top photo of the vineyard pair) |
| `infographic/career-agribusiness.webp` | Career card 3 | **Missing** (the layout shows a farmer in a vegetable garden) |

Sizes follow the web checklist: content images under 200 KB, background images under 300 KB.
## Nice to have (stand-ins are drawn in code)

| File | Section | Stand-in right now |
|---|---|---|
| `scribbles/underline.svg` | Under the Rationale heading | Simple two-stroke orange underline |
| `scribbles/loop-down.svg` | Closing band arrow | Simple looping arrow |
| `scribbles/loop-small.svg` | (not used now) | Small looping arrow |
| `scribbles/loop-right.svg` | (not used now) | Looping arrow to the right |
| `scribbles/loop-curl.svg` | Career callout (Agri-career branches) and the small arrow beside "5 Applied Concepts" | Curl, then an arrow pointing down and to the right |
| `scribbles/star.svg` | (not used now) | Orange star |

Scribble SVGs keep their own colors. The stand-ins take the color of the section.

## Fonts (affects every heading)

**In place.** Magic Yellow (headings), Etna Sans Serif (sub-headings) and Garet Book + Heavy (body) are in `public/fonts/` as woff2, wired in `src/styles/fonts.css` and the stacks in `global.css`. The originals are in the `Fonts/` folder next to the site (Magic Yellow and Etna were converted from .otf).

- Magic Yellow has no accented letters (n with tilde, a with accent), no dashes or "...". Etna has no peso sign or "...". Garet has no peso sign. The browser shows those few characters in a fallback: Bagel Fat One (installed, headings only) or the phone's own font for the rest. Avoid them in headings.
- Keep a record of where each font was downloaded and its license. Garet's file says "End user license agreement at spacetype.co" and the Etna file is a "free font" release. Check that both allow use on a public website before the site goes live.

## Smaller copies of photos (for phones)

`intro/farmer-field-640.webp`, `-960.webp`, `closing/field-tractor-720.webp`, `-1080.webp` and `home/farmer-cutout-2-320.webp` are smaller copies of the photos next to them, so phones download less. If you replace one of those photos, make its smaller copies again (same names, smaller widths).

## Decisions still open

1. **Infographic icons and plant.** "What do you actually do in Agri?" is drawn in code from the layout. The five station icons (organic agriculture, crops production, horticulture, aquaculture, food processing), the plant and the soil are **stand-in drawings** in the brand greens. If the design team has the real icons, send them as SVGs (one per station, ideally with the outline and the filled parts as separate shapes, so they can still draw themselves in). The five descriptions in the speech bubbles were read from the layout image: please check the wording.
2. **Agri-career grass tuft.** The grass tuft at the top right of the Agri-career section is drawn in code; send the real drawing as an SVG if you want it exact.
3. **Orange text and pills.** Cream text on the orange nav pills, and orange text on the cream footer, are low contrast (about 2.8 to 1), as in the mockups. Match exactly, or darken the orange only where text sits on it?
4. **Tablet and phone layouts.** The mockups are desktop only. Layouts below 960 px stack the same pieces.
5. **Social links, Privacy Policy page.** Footer links are placeholders (`#` and `/privacy`).
6. **Career job lists.** The worksheet's job titles (Agri-Technologist, and so on) are in the page for screen readers but not shown, since the mockup shows only the titles.

## Community page: content to replace before launch

| Where | What | Notes |
|---|---|---|
| `src/data/community-content.js`, `testimonials` | 3 real testimonials from alumni or agri-pioneers | Quote, name, role, school. **Get the person's permission.** Remove `sample: true` |
| `src/data/schools.json` | The real list of schools (SHS and colleges) that offer Agri-Fishery or agriculture courses | One object per school: name, type (`SHS` or `College`), province, city, programs. The team is collecting this |
| `src/data/community-content.js`, `faq` | Check the 7 answers | They are written only from what the worksheet says. Add questions the team gets asked, and anything about enrolling or costs once it is confirmed |
| `src/data/community-content.js`, `samplePosts` | Only for the demo (mock mode). Nothing to replace | Disappears when the forum goes live |
| `src/data/community.config.js` | Set `showSampleTags` to `false` | Removes the yellow "Sample" tags |

## About page: content to add

| File | Section | Notes |
|---|---|---|
| `public/images/about/objective-inform.webp` or `public/videos/about/objective-inform.mp4` | Objectives stage, "Inform" | The Video Feature on CNHS's GREEN Zone and the VermiTea research. A video is shown muted and loops; a still image works too. 16:9, under 200 KB for an image |
| `public/images/about/objective-provide.webp` | Objectives stage, "Provide" | A picture of the website (for example on a laptop and a phone). 16:9 |
| `public/images/about/objective-create.webp` | Objectives stage, "Create" | The branded VermiTea Kit. 16:9 |
| `src/data/about-content.js`, `missionVision.vision` | Mission / Vision | The vision is from the worksheet (the design showed only the mission). Confirm the wording |
| Partner logos | Partnerships band | The design shows only the word "Partnerships" scrolling. Logos or names can be added once 4-H, SEED Philippines and DA-ATI have given permission |

## Youth in Agri page: content to add

| File (in `public/images/youth/` unless noted) | Section | Notes |
|---|---|---|
| `public/videos/youth/feature.mp4` (+ `feature-poster.webp`), or a YouTube id in `src/data/youth-content.js` | Top lime block | The Video Feature (CNHS GREEN Zone and the VermiTea research). Keep the file small or use YouTube |
| `green-zone.webp` | GREEN Zone, arch photo | Tall photo, shown in an arch about 41 x 42 (nearly square) |
| `green-zone-1.webp` to `green-zone-5.webp` | Photo strip under it | 37 x 20 (landscape). Add or remove slots in `youth-content.js`, `greenZone.gallery` |
| `vermitea-kit.webp` | VermiTea Kit story | A transparent cut-out of the carry box, about square. The design shows the box render with the "ani natin / vermitea fertilizer kit" print |
| `4h-club.webp`, `seed-philippines.webp`, `da-ati.webp` | The three expanding frames | Shown small (about 21 x 18) in the open frame and large (tall, 26 x 49) in a closed one, so use photos that crop well to both |
| `src/data/youth-content.js` | All the short paragraphs | **Draft copy**, written only from the worksheet's headlines (GREEN Zone, VermiTea, 4-H, SEED, DA-ATI). Replace each with the real story and check nothing in it is wrong |
| Partner names and logos | Diagram and frames | The names of 4-H Club Philippines, SEED Philippines and DA-ATI are used. Get their permission before launch (and before adding logos or links to their sites) |
