// Shared motion helpers used by every page (Home, Community, ...). Page scripts add their own effects.
// - Smooth, inertial scrolling with Lenis (the same approach as the two26.studio reference), tied to ScrollTrigger
//   so pinned scenes and scrubbed animations glide with it. Only transforms, opacity, clip-path and stroke drawing
//   are animated, so nothing changes layout.
// - Skipped entirely for visitors who prefer reduced motion (the "rm" flag is set before first paint),
//   and skipped if it could not start in time ("anim-fail"). In both cases the page is simply static.
// - Elements are marked in the markup with data attributes:
//     data-split  text that rises out of line masks      data-reveal  fades up
//     data-pop    scales in with a small overshoot       data-clip    opens like a curtain (pill photos)
//     data-draw   hand-drawn marks that draw themselves  data-card    career cards swing up (Home)
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export { gsap, ScrollTrigger };
export const root = document.documentElement;
export let lenis = null;
export const q = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/* ---------- Text: lines rise out of masks ---------- */
export function splitReveal(el, { load = false, delay = 0, start = 'top 86%', gate = null } = {}) {
  gsap.set(el, { visibility: 'visible' });
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    aria: 'none', // the text stays real text; an aria-label on a <p> is not allowed
    onSplit(self) {
      // The line masks hide overflow; give them breathing room so descenders (g, y, p) are never clipped
      (self.masks || []).forEach((mask) => {
        mask.style.paddingBlock = '0.14em';
        mask.style.marginBlock = '-0.14em';
      });
      if (el._revealed) return; // already played; a later re-split (resize) just keeps the text visible
      if (el._tl) el._tl.kill();
      const tl = gsap.timeline({
        delay,
        paused: !!gate, // waits for the loading screen to open (see loader-gate.js)
        scrollTrigger: load ? undefined : { trigger: el, start, once: true },
        onComplete: () => (el._revealed = true),
      });
      el._tl = tl;
      if (gate) gate.then(() => tl.play());
      tl.from(self.lines, { yPercent: 110, duration: 0.95, ease: 'power3.out', stagger: 0.1 });
      // yellow highlight marks wipe in after the line arrives
      q('.mark', el).forEach((mark) =>
        tl.fromTo(mark, { '--mark': '0%' }, { '--mark': '100%', duration: 0.7, ease: 'power2.out' }, '-=0.4'),
      );
      return tl;
    },
  });
}

/* ---------- Generic reveals, batched so neighbors arrive in a gentle stagger ---------- */
export function setupReveals() {
  const reveal = q('[data-reveal]');
  if (reveal.length) {
    gsap.set(reveal, { autoAlpha: 0, y: 34 });
    ScrollTrigger.batch(reveal, {
      start: 'top 94%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.12, overwrite: true }),
    });
  }

  const pop = q('[data-pop]');
  if (pop.length) {
    gsap.set(pop, { autoAlpha: 0, scale: 0.72, rotate: -5, transformOrigin: '50% 50%' });
    ScrollTrigger.batch(pop, {
      start: 'top 94%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1, ease: 'back.out(1.5)', stagger: 0.15, overwrite: true }),
    });
  }

  const clip = q('[data-clip]');
  if (clip.length) {
    gsap.set(clip, { autoAlpha: 1, clipPath: 'inset(0% 100% 0% 0% round 999px)' });
    ScrollTrigger.batch(clip, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 1.2, ease: 'power3.inOut', stagger: 0.22, overwrite: true }),
    });
  }

  // Hand-drawn marks draw themselves. A designed .svg file (loaded as an image) is wiped in instead.
  q('[data-draw]').forEach((el) => {
    gsap.set(el, { visibility: 'visible' });
    if (el.tagName.toLowerCase() === 'svg') {
      const paths = q('path', el);
      gsap.set(paths, { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => gsap.to(paths, { drawSVG: '100%', duration: 1.2, ease: 'power2.inOut' }),
      });
    } else {
      gsap.set(el, { clipPath: 'inset(0 100% 0 0)' });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => gsap.to(el, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power2.inOut' }),
      });
    }
  });

  q('[data-split]').forEach((el) => {
    if (el.hasAttribute('data-split-load')) return; // plays on load, after the loading screen (home-animations.js)
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      splitReveal(el);
    };
    // set up when it is within one and a half screens (also if the page was opened already scrolled past it)
    ScrollTrigger.create({ trigger: el, start: 'top bottom+=150%', once: true, onEnter: go, onLeave: go });
  });

  // Safety net: when the very end of the page is reached, show anything still waiting.
  // (An element near the bottom edge can sit just short of its trigger line on short screens.)
  ScrollTrigger.create({
    trigger: 'footer',
    start: 'bottom bottom+=2',
    once: true,
    onEnter: () => {
      const pending = q('[data-reveal],[data-pop],[data-card],[data-fade]').filter((el) => +gsap.getProperty(el, 'opacity') < 1);
      if (pending.length) gsap.to(pending, { autoAlpha: 1, y: 0, scale: 1, rotate: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
      const clips = q('[data-clip]');
      if (clips.length) gsap.to(clips, { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 0.7, overwrite: 'auto' });
    },
  });
}

/* ---------- The header floats in (pages without the Home intro) ---------- */
export function headerEntrance() {
  const header = document.querySelector('.site-header');
  if (header) gsap.from(header, { autoAlpha: 0, y: -22, duration: 0.9, delay: 0.15, ease: 'power3.out' });
}

/* ---------- Smooth scrolling ----------
   Mouse wheel and trackpad scrolling eases (touch screens keep their own native, already smooth, scrolling).
   It waits while the loading screen is up, and is skipped for reduced motion. The dialog and the search
   dropdown keep their normal scrolling. To turn it off everywhere, remove the setupSmoothScroll() call below. */
function setupSmoothScroll() {
  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    anchors: true,
    autoRaf: false,
    prevent: (node) => !!node.closest?.('dialog, .cm-results, [data-lenis-prevent]'),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  if (root.classList.contains('loader-on')) {
    lenis.stop();
    const watcher = new MutationObserver(() => {
      if (!root.classList.contains('loader-on')) {
        watcher.disconnect();
        lenis.start();
      }
    });
    watcher.observe(root, { attributes: true, attributeFilter: ['class'] });
  }
}

/* ---------- Boot: waits for the fonts, registers the plugins, then runs the page's own setup ---------- */
export async function startMotion(setup) {
  if (root.classList.contains('rm')) return;

  // Wait for the fonts so line splitting measures the real text (but never wait long)
  const fonts = Promise.all([
    document.fonts.load('400 1em "Magic Yellow"'),
    document.fonts.load('700 1em "Etna Sans Serif"'),
    document.fonts.load('400 1em "Garet"'),
    document.fonts.load('700 1em "Garet"'),
  ]).catch(() => null);
  await Promise.race([fonts, new Promise((resolve) => setTimeout(resolve, 2500))]);

  if (root.classList.contains('anim-fail')) return; // took too long: the page stays static

  // Safety net: the Home intro is a held stage that must have a real height. If a browser could not work one
  // out (it does not understand some CSS), fall back to the simple stacked page instead of showing a blank screen.
  const stage = document.querySelector('.intro__stage');
  if (stage && stage.getBoundingClientRect().height < 120) {
    root.classList.add('anim-fail');
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
  setupSmoothScroll();

  setup();

  root.classList.add('anim-ready');
  window.dispatchEvent(new Event('ani:ready')); // tells the loading screen it may open
  // one refresh once everything (images) has loaded; the fonts were already waited for above
  if (document.readyState === 'complete') requestAnimationFrame(() => ScrollTrigger.refresh());
  else window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
