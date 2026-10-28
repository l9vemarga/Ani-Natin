// Home page animation pass. The shared pieces (text lines, reveals, boot) live in motion.js; this file
// adds what only the Home page has: the pinned intro, the pipeline infographic, the career section
// and the closing band.
import { gsap, ScrollTrigger, q, splitReveal, setupReveals, startMotion } from './motion.js';
import { loaderOpen } from './loader-gate.js';
import { setupVine } from './vine-scroll.js';

/* ---------- Intro: one held stage, three screens, then the hero ----------
   Screen 1 (the first thing you see) plays when the loading screen opens. After that the scroll does the work:
   the stage is held in place (position: sticky inside a tall track whose height is set here), the camera pans
   down the drawing (the path flows into the brown ground, screen 2), the photo opens from the bottom-left
   corner (screen 3), and finally the hero rises over the held photo. Every part moves with the scroll and is
   smoothed (scrub), so it keeps gliding for a moment after you stop. After the hero the page scrolls as usual. */
function setupIntro() {
  const intro = document.querySelector('.intro'); // the tall track
  const stage = intro && intro.querySelector('.intro__stage'); // the held 100vh stage
  const story = document.querySelector('.story');
  const header = document.querySelector('.site-header');
  // Entrance on load. Everything is set to its start state now and plays when the loading screen opens
  // (right away when there is none).
  const entrance = gsap.timeline({ paused: true });
  if (header) entrance.from(header, { autoAlpha: 0, y: -22, duration: 0.9, ease: 'power3.out' }, 0.15);
  if (!intro || !stage || !story) {
    loaderOpen.then(() => entrance.play());
    return;
  }

  // Screen 1: the headline rises, the food arrives piece by piece from the bowl outwards, the path draws
  splitReveal(story.querySelector('.s-head'), { load: true, delay: 0.3, gate: loaderOpen });
  const piece = (selector) => story.querySelector(selector);
  const food = ['.s-hole', '.s-rice', '.s-lettuce', '.s-bok', '.s-fish', '.s-blob', '.s-splat'].map(piece);
  gsap.set(food, { autoAlpha: 0, scale: 0.35, transformOrigin: '50% 70%' });
  entrance.to(food, { autoAlpha: 1, scale: 1, duration: 1, ease: 'back.out(1.8)', stagger: 0.13 }, 0.6);

  if (window.matchMedia('(min-width: 960px)').matches) {
    gsap.set('.ribbon-draw', { drawSVG: '0%' });
    entrance.to('.ribbon-draw', { drawSVG: '100%', duration: 2.8, ease: 'power2.inOut' }, 1.25);
  }
  entrance.from('.s-cue', { autoAlpha: 0, y: 10, duration: 0.8, ease: 'power2.out' }, 2);
  loaderOpen.then(() => entrance.play());

  // The food floats a little, each piece at its own pace, once it has arrived
  food.forEach((el, index) => {
    gsap.to(el, {
      y: index % 2 ? -7 : 7,
      rotation: el.classList.contains('s-splat') ? '-=6' : index % 2 ? 2 : -2,
      duration: 2.6 + index * 0.35,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 3 + index * 0.2,
    });
  });

  // The pieces that arrive later start hidden (they are shown by the scroll timeline below)
  const lines = (selector) => q(`${selector} .ln`, story);
  const note = lines('.s-note');
  const quote = lines('.s-quote');
  const pero = lines('.s-pero');
  const mark = q('.s-pero .mark', story);
  const title = q('.frame2__title .ln', intro);
  gsap.set([note, quote, pero, title], { autoAlpha: 0, yPercent: 70 });
  gsap.set(mark, { '--mark': '0%' });

  // How far the camera has to travel (the drawing is taller than the screen), how long the scroll runs for it,
  // and the track: one screen for the held stage, the scroll run, and one screen while the hero rises over it
  const screen = () => stage.clientHeight;
  const pan = () => Math.max(0, story.offsetHeight - screen());
  const runLength = () => Math.round(pan() * 1.1 + screen() * 1.15);
  const sizeTrack = () => {
    intro.style.height = screen() + runLength() + screen() + 'px';
  };
  sizeTrack();
  ScrollTrigger.addEventListener('refreshInit', sizeTrack);
  const photo = intro.querySelector('.frame--photo');

  // One timeline, 100 units long: the pan takes the first 58, the photo opening the rest.
  // The scroll length follows the distances, so the pace is the same on every screen.
  const P = 58;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: intro,
      start: 'top top',
      end: () => '+=' + runLength(),
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });

  tl.to(story, { y: () => -pan(), duration: P }, 0)
    // screen 1 lets go: the cue goes, the headline lifts away, the food drifts up a little faster than the path
    .fromTo('.s-cue', { autoAlpha: 1 }, { autoAlpha: 0, duration: 4, immediateRender: false }, 0)
    .to(story.querySelector('.s-head'), { autoAlpha: 0, yPercent: -40, duration: 12 }, 4)
    .to('.s-cluster', { yPercent: -16, duration: P }, 0)
    .to(note, { autoAlpha: 1, yPercent: 0, duration: 7, stagger: 2.4, ease: 'power2.out' }, 5)
    // screen 2: the statements rise as the brown ground fills the screen
    .to(quote, { autoAlpha: 1, yPercent: 0, duration: 8, stagger: 2.2, ease: 'power2.out' }, P * 0.34)
    .to(pero, { autoAlpha: 1, yPercent: 0, duration: 8, stagger: 2.2, ease: 'power2.out' }, P * 0.58)
    .to(mark, { '--mark': '100%', duration: 7, ease: 'power2.out' }, P * 0.58 + 6)
    // screen 3: they make way as the photo opens from the bottom-left corner
    .to([...note, ...quote, ...pero], { autoAlpha: 0, yPercent: -35, duration: 10, stagger: 0.6 }, 56)
    .fromTo(photo, { clipPath: 'circle(0% at 10% 100%)' }, { clipPath: 'circle(150% at 10% 100%)', duration: 38, ease: 'power2.inOut' }, 54)
    .fromTo('.frame2__photo', { scale: 1.2 }, { scale: 1, duration: 46 }, 54)
    .from('.frame2__ring', { scale: 0.5, transformOrigin: '100% 100%', duration: 14 }, 76)
    .to(title, { autoAlpha: 1, yPercent: 0, duration: 9, stagger: 2.6, ease: 'power2.out' }, 78)
    .set(story, { autoAlpha: 1 }, 0)
    .set(story, { autoAlpha: 0 }, 93)
    .set({}, {}, 100);

  // The hero rises over the held photo: the photo sinks back and dims, the hero's own pieces settle as it arrives
  const hero = document.querySelector('#home');
  if (hero) {
    const cover = { trigger: hero, start: 'top bottom', end: 'top top', scrub: true };
    gsap.fromTo(photo, { scale: 1, filter: 'brightness(1)' }, { scale: 0.9, filter: 'brightness(0.55)', ease: 'none', scrollTrigger: cover });
    gsap.fromTo('.hero__cutout', { yPercent: 12 }, { yPercent: 0, ease: 'none', scrollTrigger: { ...cover, end: 'top 15%' } });
    gsap.fromTo('.hero__copy', { yPercent: 7 }, { yPercent: 0, ease: 'none', scrollTrigger: { ...cover, end: 'top 15%' } });
  }
}

/* ---------- Infographic: the vine follows the visitor (vine-scroll.js) ---------- */
function setupInfographic() {
  setupVine();
}

/* ---------- Career branches: hills rise, the grass tuft pops, cards swing up one by one ---------- */
function setupCareers() {
  const section = document.querySelector('.careers');
  if (!section) return;

  const mm = gsap.matchMedia();

  // Hills only exist from 640px up. They rise into place as the screen arrives (tied to the scroll).
  mm.add('(min-width: 640px)', () => {
    const hills = q('.careers__hills path:not(.tuft), .careers__wave path');
    gsap.set(hills, { y: 90 });
    gsap.to(hills, {
      y: 0,
      ease: 'none',
      stagger: 0.12,
      scrollTrigger: { trigger: section, start: 'top 92%', end: 'top 18%', scrub: 0.6 },
    });
    gsap.set('.careers__hills .tuft', { scale: 0, transformOrigin: '50% 100%' });
    gsap.to('.careers__hills .tuft', {
      scale: 1,
      duration: 0.9,
      ease: 'back.out(2.4)',
      scrollTrigger: { trigger: section, start: 'top 40%', once: true },
    });
  });

  // Cards: each swings up from below with a slight tilt, and its photo settles from a zoomed-in start
  const cards = q('.careers [data-card]');
  gsap.set(cards, { autoAlpha: 0, y: 150, scale: 0.93, rotate: (i) => [-4, 2, 4][i] || 0, transformOrigin: '50% 100%' });
  ScrollTrigger.create({
    trigger: section,
    start: 'top 45%',
    once: true,
    onEnter: () => {
      gsap.to(cards, { autoAlpha: 1, y: 0, scale: 1, rotate: 0, duration: 1.15, ease: 'back.out(1.25)', stagger: 0.16 });
      gsap.fromTo(q('.careers .branch__photo'), { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'power3.out', stagger: 0.16 });
    },
  });
}

/* ---------- Closing band: slow parallax on the photo ---------- */
function setupBand() {
  const photo = document.querySelector('.band__photo');
  if (!photo) return;
  gsap.fromTo(
    photo,
    { yPercent: -7, scale: 1.2 },
    { yPercent: 7, scale: 1.2, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } },
  );
}

startMotion(() => {
  setupIntro();
  setupReveals();
  setupInfographic();
  setupCareers();
  setupBand();
});
