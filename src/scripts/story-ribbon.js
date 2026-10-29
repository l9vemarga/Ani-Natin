// The brown path that grows out of the food cluster on the Home intro, and flows into the brown ground.
//
// It follows the visitor: its tip stays about 85% of the way down the screen, so it grows down the page as
// you scroll (and pulls back in when you scroll up). On load it only draws the first stretch, up to where the
// tip starts.
//
//   Desktop (960px and up): the path is part of the big drawing (the centerline `.ribbon-draw` is a mask that
//   reveals the brown shape, see IntroFrames.astro), in the 1440px design.
//   Phones and tablets: there is no drawing to trace, so the path is built here from where things are: it
//   leaves the bowl of food, sweeps left and runs down into the brown panel.
//
// home-animations.js calls createRibbon() and tells it how far the camera has travelled (`apply(k)`, k from 0 to 1).
import { gsap, ScrollTrigger } from './motion.js';

export function createRibbon(story, stage) {
  const desktop = window.matchMedia('(min-width: 960px)').matches;
  const el = desktop ? story.querySelector('.ribbon-draw') : story.querySelector('.rb-path');
  if (!el) return null;
  const tipFrac = desktop ? 0.85 : 0.88; // where on the screen the tip stays
  const pan = () => Math.max(0, story.offsetHeight - stage.clientHeight);

  let total = 1;
  let lens = [];
  let ys = [];
  let ready = false; // the load entrance has drawn the first stretch; before that, the scroll leaves it alone
  let lastK = 0;

  // Phone / tablet: build the path from the page's own layout (all measured relative to the story)
  function buildPath() {
    const box = story.getBoundingClientRect();
    const rel = (node) => {
      const r = node.getBoundingClientRect();
      return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height };
    };
    const W = box.width;
    const c = rel(story.querySelector('.s-cluster'));
    const p = rel(story.querySelector('.story__b'));
    const hx = c.x + c.w * 0.56; // under the bowl
    const hy = c.y + c.h * 0.9;
    const endY = p.y + Math.min(p.h * 0.12, 80); // a little way into the brown panel, so it merges with it
    const h = endY - hy;
    // It runs down the left side, clear of the note ("At sa bawat kain..."), which starts further right
    const sw = Math.max(30, W * 0.1);
    const note = rel(story.querySelector('.s-note'));
    const xm = Math.min(Math.max(note.x - sw / 2 - 10, sw / 2 + 6), W * 0.32);
    const d =
      `M${hx} ${hy}` +
      `C${hx - W * 0.34} ${hy + h * 0.04} ${xm - W * 0.03} ${hy + h * 0.2} ${xm} ${hy + h * 0.45}` +
      `C${xm} ${hy + h * 0.62} ${xm + W * 0.03} ${endY - h * 0.14} ${xm} ${endY}`;
    el.setAttribute('d', d);
    el.setAttribute('stroke-width', String(sw));
  }

  function measure() {
    let scale = 1;
    if (desktop) scale = story.querySelector('.story__art').getBoundingClientRect().width / 1440;
    else buildPath();
    total = el.getTotalLength();
    const n = Math.max(80, Math.ceil(total / 6));
    lens = [];
    ys = [];
    let run = -Infinity;
    for (let i = 0; i <= n; i++) {
      const len = (total * i) / n;
      run = Math.max(run, el.getPointAtLength(len).y * scale); // only ever goes down the page
      lens.push(len);
      ys.push(run);
    }
  }

  function lenAtY(y) {
    if (y <= ys[0]) return 0;
    if (y >= ys[ys.length - 1]) return total;
    let lo = 0;
    let hi = ys.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (ys[mid] <= y) lo = mid;
      else hi = mid;
    }
    const f = (y - ys[lo]) / Math.max(0.0001, ys[hi] - ys[lo]);
    return lens[lo] + f * (lens[hi] - lens[lo]);
  }

  const pct = (len) => Math.max(0, Math.min(100, (len / total) * 100));
  const startPct = () => Math.max(8, pct(lenAtY(tipFrac * stage.clientHeight)));
  const draw = (percent) => gsap.set(el, { drawSVG: `0% ${percent}%` });

  measure();
  gsap.set(el, { drawSVG: '0%' });
  ScrollTrigger.addEventListener('refresh', () => {
    measure();
    if (ready) apply(lastK);
  });

  // k: how far the camera has panned (0 to 1). The tip sits at the same place on the screen, so on the drawing
  // it moves down by exactly as much as the camera does.
  function apply(k) {
    lastK = k;
    if (!ready) return;
    draw(pct(lenAtY(tipFrac * stage.clientHeight + pan() * k)));
  }

  return {
    // the load entrance draws the first stretch; after that the scroll takes over
    entrance(timeline, at) {
      const s = startPct();
      timeline.to(el, { drawSVG: `0% ${s}%`, duration: 1.6, ease: 'power2.out' }, at);
      timeline.add(() => {
        ready = true;
        apply(lastK);
      }, at + 1.65);
    },
    apply,
  };
}
