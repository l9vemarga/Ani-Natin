// Community page motion, in the same language as the Home page: lines rise out of masks, cards fade up,
// decorations pop in and then drift a little. The interactive bits (tabs, accordion, topic rows, search
// results, dialog) animate themselves in community.js and community.css.
import { gsap, ScrollTrigger, q, setupReveals, headerEntrance, startMotion } from './motion.js';

function setupHero() {
  // (the hero text itself arrives through data-split / data-reveal, like everywhere else)
  // decorations drift gently, and move a little slower than the page as it scrolls
  q('.cm-deco').forEach((node, index) => {
    gsap.to(node, { y: index % 2 ? 14 : -14, rotation: index % 2 ? 3 : -3, duration: 3 + index * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });
  q('.cm-deco--blob-orange, .cm-deco--blob-lime').forEach((node, index) => {
    gsap.to(node, {
      yPercent: index ? -14 : 12,
      ease: 'none',
      scrollTrigger: { trigger: '.cm-hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  });
}

function setupHub() {
  // the two big cards swing up one after the other when the green section arrives
  // (data-fade: opacity only, so the tabs stay reachable with the Tab key before they appear; the
  // end-of-page safety net shows them if something goes wrong)
  const cards = q('.cm-card');
  gsap.set(cards, { opacity: 0, y: 90, scale: 0.94, rotate: (i) => (i ? 3 : -3), transformOrigin: '50% 100%' });
  ScrollTrigger.batch(cards, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 1.1, ease: 'back.out(1.5)', stagger: 0.14 }),
  });
}

startMotion(() => {
  headerEntrance();
  setupHero();
  setupReveals();
  setupHub();
});
