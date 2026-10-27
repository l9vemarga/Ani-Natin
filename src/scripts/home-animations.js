// Home page animation pass. The shared pieces (text lines, reveals, boot) live in motion.js; this file
// adds what only the Home page has: the pinned intro, the pipeline infographic, the career section
// and the closing band.
import { gsap, ScrollTrigger, q, splitReveal, setupReveals, startMotion } from './motion.js';
import { loaderOpen } from './loader-gate.js';

/* ---------- Intro: entrance, then frame 2 opens from the green quarter-circle as you scroll ---------- */
function setupIntro() {
  const stage = document.querySelector('.intro-stage');
  const header = document.querySelector('.site-header');
  // Entrance on load. Everything is set to its start state now and plays when the loading screen opens
  // (right away when there is none).
  const entrance = gsap.timeline({ paused: true });
  if (header) entrance.from(header, { autoAlpha: 0, y: -22, duration: 0.9, ease: 'power3.out' }, 0.15);
  if (!stage) {
    loaderOpen.then(() => entrance.play());
    return;
  }

  const frameOne = stage.querySelector('.frame--one');
  const frameTwo = stage.querySelector('.frame--two');

  splitReveal(frameOne.querySelector('.frame1__top'), { load: true, delay: 0.3, gate: loaderOpen });
  splitReveal(frameOne.querySelector('.frame1__bottom'), { load: true, delay: 0.7, gate: loaderOpen });
  entrance
    .from('.frame1__quarter', { scale: 0.55, transformOrigin: '0% 100%', duration: 1.2, ease: 'power3.out' }, 0.2)
    .from('.frame1__slash', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.8, ease: 'power2.out' }, 0.95)
    .from('.frame1__art', { autoAlpha: 0, y: 18, duration: 0.9, ease: 'power3.out' }, 0.9)
    .from('.frame1__cue', { autoAlpha: 0, y: 10, duration: 0.8, ease: 'power2.out' }, 1.7);
  loaderOpen.then(() => entrance.play());

  // Scroll-driven transition (the stage is pinned for about one and a quarter screens of scrolling)
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: '+=125%',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      onUpdate: (self) => {
        if (header) header.setAttribute('data-theme', self.progress < 0.45 ? 'intro' : 'home');
      },
    },
  });

  tl.to('.frame1__cue', { autoAlpha: 0, duration: 0.08 }, 0)
    .to(
      frameOne.querySelectorAll('.frame1__top, .frame1__bottom, .frame1__art, .frame1__slash'),
      { yPercent: -14, autoAlpha: 0, duration: 0.45, stagger: 0.04 },
      0.04,
    )
    .fromTo(
      frameTwo,
      { clipPath: 'circle(0% at 10% 100%)' },
      { clipPath: 'circle(150% at 10% 100%)', duration: 0.85, ease: 'power2.inOut' },
      0,
    )
    .fromTo('.frame2__photo', { scale: 1.2 }, { scale: 1, duration: 1 }, 0)
    .from('.frame2__ring', { scale: 0.5, transformOrigin: '100% 100%', duration: 0.5 }, 0.45)
    .from('.frame2__icon', { autoAlpha: 0, scale: 0.7, rotate: -14, duration: 0.35 }, 0.62)
    .from('.frame2__title .ln', { yPercent: 55, autoAlpha: 0, duration: 0.28, stagger: 0.07 }, 0.5)
    .from('.frame2__invite', { y: 24, autoAlpha: 0, duration: 0.25 }, 0.74);
}

/* ---------- Infographic: the pipeline builds as you scroll ---------- */
function setupInfographic() {
  const mm = gsap.matchMedia();

  mm.add('(min-width: 640px)', () => {
    const order = ['.node--circle', '.node--lime', '.node--dark', '.node--triangle', '.node--rect'];
    const nodes = order.map((s) => document.querySelector(s));
    // opacity only (not autoAlpha), so the shapes stay reachable with the Tab key before they are revealed
    gsap.set(nodes, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' });
    gsap.set('.info__bg .l-orange, .info__bg .l-green', { drawSVG: '0%' });
    gsap.set('.info__bg .dot', { scale: 0, svgOrigin: '86 825' });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.node--circle',
        start: 'top 80%',
        endTrigger: '.node--rect',
        end: 'bottom 58%',
        scrub: 0.6,
      },
    });
    order.forEach((selector, i) => tl.to(selector, { opacity: 1, scale: 1, duration: 0.14, ease: 'back.out(1.6)' }, i * 0.2));
    tl.to('.info__bg .l-orange', { drawSVG: '100%', duration: 0.75 }, 0.06)
      .to('.info__bg .l-green', { drawSVG: '100%', duration: 0.4 }, 0.62)
      .to('.info__bg .dot', { scale: 1, duration: 0.08 }, 0.98);
  });

  mm.add('(max-width: 639px)', () => {
    const nodes = q('.node');
    gsap.set(nodes, { opacity: 0, y: 26 });
    ScrollTrigger.batch(nodes, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 }),
    });
  });
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
