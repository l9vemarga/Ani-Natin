// Vine hover for the pill buttons (header links and .pill-btn).
// Idea borrowed from two26.studio: a line draws itself across the button while its stroke thickens until
// it fills the pill. Here it is two twisting vines, with leaves, a flower and a sparkle that pop out of
// the edges and sway while the pointer stays on the button. It all reverses when the pointer leaves.
// - The markup is added on first hover, measured from the real button, so nothing in the HTML changes.
// - Mouse and keyboard focus only (touch has no hover, so taps just navigate). Skipped for reduced motion.
// - Colors come from CSS (see "Vine hover" in global.css): --vine-fill and --vine-ink per button.
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

const SVG_NS = 'http://www.w3.org/2000/svg';
const n = (value) => +value.toFixed(1);
const states = new WeakMap();

function el(tag, attrs, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  parent.appendChild(node);
  return node;
}

function wave(w, h, flip) {
  // A sine-like line across the button, starting and ending past the edges so the ends are always covered
  const amp = h * 0.2;
  const seg = h * 0.9;
  const x0 = -h * 0.5;
  const count = Math.ceil((w + h) / seg);
  const cy = h / 2;
  let d = `M${n(x0)} ${n(cy)}Q${n(x0 + seg / 2)} ${n(cy + (flip ? amp : -amp) * 2)} ${n(x0 + seg)} ${n(cy)}`;
  for (let i = 2; i <= count; i += 1) d += `T${n(x0 + seg * i)} ${n(cy)}`;
  return d;
}

function build(btn) {
  const w = btn.offsetWidth;
  const h = btn.offsetHeight;
  const u = h;
  const old = states.get(btn);
  if (old) {
    old.tl.kill();
    old.sways.forEach((t) => t.kill());
    old.nodes.forEach((node) => node.remove());
  }

  // Layer 1: the vines that fill the pill (clipped to the pill shape)
  const fill = document.createElement('span');
  fill.className = 'vine__fill';
  fill.setAttribute('aria-hidden', 'true');
  const fillSvg = el('svg', { width: w, height: h, viewBox: `0 0 ${w} ${h}` }, fill);
  const vines = [wave(w, h, false), wave(w, h, true)].map((d) => el('path', { class: 'vine__stem', d }, fillSvg));

  // Layer 2: leaves, flower and sparkle poking out of the edges (not clipped)
  const decor = document.createElement('span');
  decor.className = 'vine__decor';
  decor.setAttribute('aria-hidden', 'true');
  const svg = el('svg', { width: w, height: h, viewBox: `0 0 ${w} ${h}` }, decor);
  svg.style.setProperty('--vine-stalk', `${n(Math.max(2, u * 0.06))}px`);
  svg.style.setProperty('--vine-outline', `${n(Math.max(1.4, u * 0.035))}px`);

  const stalks = [];
  const pops = []; // { node, x, y }: things that scale in from a point

  const stalk = (d) => stalks.push(el('path', { class: 'vine__stalk', d }, svg));
  const popGroup = (x, y) => {
    const node = el('g', {}, svg);
    pops.push({ node, x, y });
    return node;
  };
  const leaf = (x, y, angle, size) => {
    const g = el('g', { transform: `translate(${n(x)} ${n(y)}) rotate(${angle})` }, popGroup(x, y));
    const s = size;
    el('path', { class: 'vine__leaf', d: `M0 0C${n(s * 0.3)} ${n(-s * 0.55)} ${n(s * 0.95)} ${n(-s * 0.5)} ${n(s * 1.15)} 0C${n(s * 0.95)} ${n(s * 0.5)} ${n(s * 0.3)} ${n(s * 0.55)} 0 0Z` }, g);
    el('path', { class: 'vine__rib', d: `M${n(s * 0.12)} 0L${n(s * 0.8)} 0` }, g);
  };
  const flower = (x, y, r) => {
    const g = el('g', { transform: `translate(${n(x)} ${n(y)})` }, popGroup(x, y));
    for (let i = 0; i < 5; i += 1) {
      const a = (i * 72 - 90) * (Math.PI / 180);
      el('circle', { class: 'vine__petal', cx: n(Math.cos(a) * r * 1.25), cy: n(Math.sin(a) * r * 1.25), r: n(r) }, g);
    }
    el('circle', { class: 'vine__heart', cx: 0, cy: 0, r: n(r * 0.8) }, g);
  };
  const sparkle = (x, y, s) => {
    const g = el('g', { transform: `translate(${n(x)} ${n(y)})` }, popGroup(x, y));
    el('path', { class: 'vine__spark', d: `M0 ${n(-s)}Q0 0 ${n(s)} 0Q0 0 0 ${n(s)}Q0 0 ${n(-s)} 0Q0 0 0 ${n(-s)}Z` }, g);
  };

  // A sprout rising from the top edge, with two leaves at its tip
  const sproutUp = (bx) => {
    stalk(`M${n(bx)} 0C${n(bx - u * 0.15)} ${n(-u * 0.25)} ${n(bx + u * 0.25)} ${n(-u * 0.4)} ${n(bx + u * 0.08)} ${n(-u * 0.68)}`);
    leaf(bx + u * 0.08, -u * 0.68, -155, u * 0.62);
    leaf(bx + u * 0.08, -u * 0.68, -28, u * 0.55);
  };
  // A curling tendril hanging from the bottom edge, with one leaf
  const tendrilDown = (bx) => {
    stalk(
      `M${n(bx)} ${n(h)}C${n(bx + u * 0.05)} ${n(h + u * 0.3)} ${n(bx - u * 0.45)} ${n(h + u * 0.5)} ${n(bx - u * 0.5)} ${n(h + u * 0.22)}` +
        `C${n(bx - u * 0.52)} ${n(h + u * 0.05)} ${n(bx - u * 0.28)} ${n(h + u * 0.05)} ${n(bx - u * 0.27)} ${n(h + u * 0.2)}`,
    );
    leaf(bx + u * 0.04, h + u * 0.27, 68, u * 0.5);
  };
  // A little flower on a short stem
  const bloom = (bx) => {
    stalk(`M${n(bx)} 0Q${n(bx - u * 0.12)} ${n(-u * 0.22)} ${n(bx + u * 0.02)} ${n(-u * 0.4)}`);
    flower(bx + u * 0.02, -u * 0.52, u * 0.15);
  };

  bloom(Math.max(u * 0.7, w * 0.1));
  sproutUp(w * 0.8);
  tendrilDown(w * 0.16 + u * 0.4);
  if (w > u * 7) {
    sproutUp(w * 0.45);
    tendrilDown(w * 0.7);
  }
  sparkle(w - u * 0.1, -u * 0.3, u * 0.22);

  btn.append(fill, decor);

  // Start hidden
  const target = h * 1.1;
  gsap.set(vines, { drawSVG: '0%', strokeWidth: 0 });
  gsap.set(stalks, { drawSVG: '0%', strokeWidth: 0 });
  pops.forEach(({ node, x, y }) => gsap.set(node, { scale: 0, svgOrigin: `${x} ${y}` }));

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power1.inOut' } });
  tl.to(vines, { drawSVG: '100%', strokeWidth: target, duration: 0.55, stagger: 0.05 }, 0)
    .to(stalks, { drawSVG: '100%', strokeWidth: n(Math.max(2, u * 0.06)), duration: 0.4, ease: 'power2.out', stagger: 0.07 }, 0.1)
    .to(pops.map((p) => p.node), { scale: 1, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.06 }, 0.28);

  const state = { w, h, tl, sways: [], nodes: [fill, decor], pops, active: false };
  tl.eventCallback('onComplete', () => {
    if (!state.active) return;
    state.sways.forEach((t) => t.kill());
    state.sways = pops.map(({ node }) =>
      gsap.to(node, {
        rotation: gsap.utils.random(3, 7) * (Math.random() < 0.5 ? -1 : 1),
        duration: gsap.utils.random(0.55, 0.9),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      }),
    );
  });
  states.set(btn, state);
  return state;
}

function enter(btn) {
  let state = states.get(btn);
  if (!state || Math.abs(state.w - btn.offsetWidth) > 1 || Math.abs(state.h - btn.offsetHeight) > 1) state = build(btn);
  state.active = true;
  btn.classList.add('is-vine');
  state.tl.timeScale(1).play();
}

function leave(btn) {
  const state = states.get(btn);
  if (!state || !state.active) return;
  if (btn.matches(':hover, :focus-visible')) return; // still hovered or focused by keyboard
  state.active = false;
  btn.classList.remove('is-vine');
  state.sways.forEach((t) => t.kill());
  state.sways = [];
  gsap.to(state.pops.map((p) => p.node), { rotation: 0, duration: 0.2, ease: 'power2.out' });
  state.tl.timeScale(1.5).reverse();
}

function init() {
  if (document.documentElement.classList.contains('rm')) return;
  gsap.registerPlugin(DrawSVGPlugin);

  const buttons = Array.from(document.querySelectorAll('.pill, .pill-btn'));
  buttons.forEach((btn) => {
    btn.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'touch') enter(btn);
    });
    btn.addEventListener('pointerleave', () => leave(btn));
    btn.addEventListener('focusin', () => {
      if (btn.matches(':focus-visible')) enter(btn);
    });
    btn.addEventListener('focusout', () => leave(btn));
  });
}

init();
