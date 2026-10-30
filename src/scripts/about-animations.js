// About page motion, in the same language as Home and Community: lines rise out of masks, cards swing up, the
// orange sprout grows, the statement lights up letter by letter as you scroll (the two26.studio-style highlight
// from the Home intro), and the vegetables rise out of the bottom of the green section. The hovering, the tabs and
// the marquee are in about.js and about.css.
import { gsap, ScrollTrigger, q, setupReveals, headerEntrance, startMotion } from './motion.js';
import { createHighlight } from './text-highlight.js';

function setupHero() {
  const dome = q('.ab-sprout__dome');
  const arcs = q('.ab-arc');
  const dot = q('.ab-sprout__dot');
  gsap.set(dome, { yPercent: 100 });
  gsap.set(arcs, { drawSVG: '0%' });
  gsap.set(dot, { scale: 0, transformOrigin: '50% 50%' });

  // the sprout grows after the headline has started to arrive: dome, then arc by arc up to the dot
  const tl = gsap.timeline({ delay: 0.35 });
  tl.to(dome, { yPercent: 0, duration: 0.9, ease: 'back.out(1.6)' });
  arcs.forEach((arc, i) => tl.to(arc, { drawSVG: '100%', duration: i === 2 ? 1.1 : 0.7, ease: 'power2.inOut' }, i === 0 ? '-=0.2' : '>-0.05'));
  tl.to(dot, { scale: 1, duration: 0.7, ease: 'back.out(2.4)' }, '-=0.15');
  tl.add(() => {
    // then the dot bobs a little, as if it were the fruit
    gsap.to(dot, { y: -6, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });
}

// The background paragraph: faded at first, lit up as it scrolls through the screen
function setupStory() {
  const text = document.querySelector('.ab-story__text');
  if (!text) return;
  const highlight = createHighlight(text, { edge: '#e5dc72', edgeOnMark: '#e5dc72', fade: 0.3 });
  gsap.set(text, { visibility: 'visible' });
  const progress = { t: 0 };
  gsap.to(progress, {
    t: 1,
    ease: 'none',
    onUpdate: () => highlight.apply(progress.t),
    scrollTrigger: { trigger: text, start: 'top 88%', end: 'bottom 38%', scrub: true },
  });
}

function setupObjectives() {
  // the three arches swing up one after the other (their tabs ride along)
  const cards = q('.ab-card');
  gsap.set(cards, { opacity: 0, y: 100, scale: 0.94, rotate: (i) => [-4, 0, 4][i % 3], transformOrigin: '50% 100%' });
  ScrollTrigger.batch(cards, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 1.1, ease: 'back.out(1.5)', stagger: 0.14 }),
  });
}

function setupHarvest() {
  const svg = document.querySelector('.ab-veg');
  if (!svg) return;
  const items = q('.ab-veg__item', svg);
  gsap.set(items, { yPercent: 105 });
  ScrollTrigger.create({
    trigger: svg,
    start: 'top 96%',
    once: true,
    onEnter: () => {
      gsap.to(items, {
        yPercent: 0,
        duration: 1.2,
        ease: 'back.out(1.3)',
        stagger: { each: 0.09, from: 'center' },
        onComplete: () => {
          // a very slight lean back and forth, like plants in a breeze (a shear, so the bottoms stay on the band)
          items.forEach((item, i) => {
            gsap.to(item, { skewX: i % 2 ? 1.6 : -1.6, transformOrigin: '50% 100%', duration: 3 + (i % 3) * 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          });
        },
      });
    },
  });
}

startMotion(() => {
  headerEntrance();
  setupHero();
  setupReveals();
  setupStory();
  setupObjectives();
  setupHarvest();
});
