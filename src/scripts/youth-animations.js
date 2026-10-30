// Youth in Agri motion, in the same language as the other pages: lines rise out of masks, pills pop, the vine drops from
// the diagram's pills, the arch opens and the photos drift as you scroll, the vegetables rise and the frames swing up.
// The frames' opening, the strip and the open / closed state of the diagram are in youth.js / youth.css.
import { gsap, ScrollTrigger, q, setupReveals, headerEntrance, startMotion } from './motion.js';

function setupHero() {
  const content = q('.yt-hero__frame > *');
  gsap.from(content, { autoAlpha: 0, y: 30, duration: 1, delay: 0.5, ease: 'power3.out', stagger: 0.1 });
}

// The story diagram. Hover (or press) CNHS or Young Pioneers and a vine drops from the pill: it grows down, reaches
// out to each story, a bud swells at the tip and stretches into an orange button, then the leaves and a tendril
// unfold around it. Moving away pulls it all back in (the same timeline, played backwards). The state itself
// (open / closed) is handled in youth.js, which tells us through "yt:tree-open" / "yt:tree-close".
function setupTree() {
  const phones = window.matchMedia('(max-width: 959px)');

  q('[data-tree]').forEach((group) => {
    const items = q('.yt-tree__list li', group);
    const main = q('.yt-vine__main', group);
    const branches = q('.yt-vine__branch', group);
    const leaves = q('.yt-vine__leaf', group);
    const tendrils = q('.yt-vine__tendril', group);
    const rings = q('.yt-vine__ring', group);
    const stub = q('.yt-vine__stub', group);
    const bud = q('.yt-vine__bud', group);
    let tl = null;

    // everything the vine will bring starts folded away
    gsap.set(items, { autoAlpha: 0 });
    gsap.set([main, branches, tendrils], { drawSVG: '0%', autoAlpha: 0 });
    gsap.set(rings, { opacity: 0 });
    gsap.set(leaves, { scale: 0, transformOrigin: '0px 0px' });
    // closed: the sprout's bud bobs a little, to say "something hangs here"
    gsap.to(bud, { y: 0.3, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    const build = () => {
      const timeline = gsap.timeline({ paused: true });
      const rowAt = (i) => 0.18 + i * 0.36; // when the vine reaches each button's row
      timeline.to(stub, { autoAlpha: 0, duration: 0.2 }, 0);
      timeline.set(main, { autoAlpha: 1 }, 0.04);
      timeline.fromTo(main, { drawSVG: '0%' }, { drawSVG: '100%', duration: rowAt(items.length - 1) + 0.1, ease: 'none' }, 0.04);

      items.forEach((li, i) => {
        const t = rowAt(i);
        const cut = li.offsetWidth - li.offsetHeight; // the bud is the left end of the button: a circle
        // 1. the branch reaches out to the button's place
        timeline.set(branches[i], { autoAlpha: 1 }, t);
        timeline.fromTo(branches[i], { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.4, ease: 'power2.inOut' }, t);
        // 2. a bud pops at the tip...
        timeline.fromTo(
          li,
          { autoAlpha: 0, scale: 0.15, transformOrigin: '0% 50%', clipPath: `inset(0px ${cut}px 0px 0px round 999px)` },
          { autoAlpha: 1, scale: 1, duration: 0.32, ease: 'back.out(2.6)' },
          t + 0.3,
        );
        // a ring spreads from the bud as it pops
        timeline.fromTo(rings[i], { scale: 0.55, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 0.9, duration: 0.12, ease: 'none' }, t + 0.32);
        timeline.to(rings[i], { scale: 1.9, opacity: 0, duration: 0.6, ease: 'power2.out' }, t + 0.44);
        // 3. ...and stretches into the button
        timeline.to(li, { clipPath: 'inset(0px 0px 0px 0px round 999px)', duration: 0.55, ease: 'power3.inOut' }, t + 0.58);
        // 4. once it has formed, the leaves unfold
        const mine = leaves.filter((leaf) => +leaf.dataset.i === i);
        timeline.fromTo(
          mine,
          { scale: 0, rotation: -50, autoAlpha: 0, transformOrigin: '0px 0px' },
          { scale: (index, leaf) => +leaf.dataset.s || 1, rotation: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(2.2)', stagger: 0.08 },
          t + 1.0,
        );
        // the tendril uncurls last
        timeline.set(tendrils[i], { autoAlpha: 1 }, t + 1.15);
        timeline.fromTo(tendrils[i], { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut' }, t + 1.15);
      });

      timeline.eventCallback('onComplete', () => phones.matches && ScrollTrigger.refresh());
      return timeline;
    };

    group.addEventListener('yt:tree-open', () => {
      if (!tl) tl = build();
      tl.eventCallback('onReverseComplete', null);
      tl.timeScale(1).play();
      if (phones.matches) ScrollTrigger.refresh();
    });

    group.addEventListener('yt:tree-close', (event) => {
      event.preventDefault(); // we finish the closing ourselves, once the vine has folded back
      if (!tl) tl = build();
      tl.eventCallback('onReverseComplete', () => {
        if (group.dataset.state === 'closing') {
          group.classList.remove('is-open');
          delete group.dataset.state;
          if (phones.matches) ScrollTrigger.refresh();
        }
      });
      tl.timeScale(2.2).reverse();
    });

    // sizes can change with the window (the bud's size is measured), so build it again when it is at rest
    window.addEventListener('resize', () => {
      if (tl && tl.progress() === 0) {
        tl.kill();
        tl = null;
      }
    });
  });
}

function setupGreenZone() {
  // the arch opens upwards like a curtain, and the photo inside drifts a little slower than the page
  const arch = document.querySelector('.yt-gz__photo');
  if (arch) {
    gsap.set(arch, { clipPath: 'inset(100% 0% 0% 0%)' });
    ScrollTrigger.create({
      trigger: arch,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(arch, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.inOut' }),
    });
    const inner = arch.firstElementChild;
    if (inner) gsap.fromTo(inner, { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: arch, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  // the strip's cards slide in from the right, one after the other
  const cards = q('.yt-card');
  gsap.set(cards, { autoAlpha: 0, x: 120 });
  ScrollTrigger.create({
    trigger: '.yt-strip',
    start: 'top 90%',
    once: true,
    onEnter: () => gsap.to(cards, { autoAlpha: 1, x: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12 }),
  });
}

function setupVermiTea() {
  const bits = q('.yt-vt__bit');
  const box = document.querySelector('.yt-vt__box');
  const tags = q('.yt-tag');
  gsap.set(bits, { scale: 0, transformOrigin: '50% 100%' });
  gsap.set(box, { autoAlpha: 0, y: 90, rotate: -7, transformOrigin: '50% 100%' });
  gsap.set(tags, { autoAlpha: 0, x: 60 });
  ScrollTrigger.create({
    trigger: '.yt-vt',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      const tl = gsap.timeline();
      tl.to(bits, { scale: 1, duration: 0.9, ease: 'back.out(1.7)', stagger: 0.14 });
      tl.to(box, { autoAlpha: 1, y: 0, rotate: 0, duration: 1.1, ease: 'back.out(1.4)' }, 0.25);
      tl.to(tags, { autoAlpha: 1, x: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15 }, 0.9);
    },
  });
}

function setupMore() {
  // the frames swing up one after the other
  const frames = q('.yt-frame');
  gsap.set(frames, { opacity: 0, y: 90 });
  ScrollTrigger.batch(frames, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'back.out(1.3)', stagger: 0.14 }),
  });
}

startMotion(() => {
  headerEntrance();
  setupHero();
  setupReveals();
  setupTree();
  setupGreenZone();
  setupVermiTea();
  setupMore();
});
