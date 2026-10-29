// "What do you actually do in Agri?": the vine follows the visitor.
//
// The vine's drawn length is tied to where you are on the page: its tip sits about two thirds of the way down
// the screen, and it eases after you (so it keeps gliding a moment after you stop). Scrolling back up pulls it
// back in. The tip carries a pair of leaves, more leaves sprout along the vine as it passes, and each station
// (icon badge, label, speech bubble) wakes up when the vine reaches it, then keeps moving gently.
//
// Two layouts share this code: the desktop drawing (one big SVG) and the phone list (the vine is built from
// where the badges are). See Infographic.astro for the markup. Only transforms, opacity and stroke drawing move.
import { gsap, ScrollTrigger, q } from './motion.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOutBack = (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
const LEAF = 'M0 0C6-14 22-18 36-12C30 3 12 9 0 0Z';
const LEAF_COLORS = ['#6aa84a', '#8fb85a', '#4f8a3a', '#7cb552'];

/* ---------- the plant at the top grows when it comes into view ---------- */
function growPlant(plant) {
  const soil = plant.querySelector('.pl-soil');
  const stem = plant.querySelector('.pl-stem');
  const root = plant.querySelector('.pl-root');
  const star = plant.querySelector('.pl-star');
  const leaves = q('.pl-leaf', plant);
  gsap.set(soil, { scaleY: 0, transformOrigin: '50% 100%' });
  gsap.set([stem, root], { drawSVG: '0%' });
  leaves.forEach((leaf) => gsap.set(leaf, { scale: 0, svgOrigin: `${leaf.dataset.ox} ${leaf.dataset.oy}` }));
  gsap.set(star, { scale: 0, rotation: -120, transformOrigin: '50% 50%' });

  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      // everything breathes a little once it is up
      leaves.forEach((leaf, i) => {
        gsap.to(leaf, { rotation: i % 2 ? 3 : -3, svgOrigin: `${leaf.dataset.ox} ${leaf.dataset.oy}`, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
      gsap.to(star, { rotation: 360, duration: 24, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    },
  });
  tl.to(soil, { scaleY: 1, duration: 0.7, ease: 'back.out(1.6)' }, 0)
    .to(stem, { drawSVG: '100%', duration: 1.1, ease: 'power2.out' }, 0.25)
    .to(leaves, { scale: 1, duration: 0.9, ease: 'back.out(2)', stagger: 0.18 }, 0.9)
    .to(star, { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2.4)' }, 1.7)
    .to(root, { drawSVG: '100%', duration: 1, ease: 'power2.inOut' }, 1.3);

  const host = plant.closest('svg');
  ScrollTrigger.create({ trigger: host, start: 'top 78%', once: true, onEnter: () => tl.play() });
}

/* ---------- one station wakes up when the vine arrives ---------- */
function buildStation(st) {
  const badge = st.querySelector('.st-badge');
  const ring = st.querySelector('.st-ring');
  const ics = q('.vi .ic', st);
  const fls = q('.vi .fl', st);
  const label = st.querySelector('.st-label');
  const bubble = st.querySelector('.st-bubble');
  const isHtml = bubble.tagName.toLowerCase() === 'p';

  gsap.set(st, { autoAlpha: 0 });
  gsap.set(ics, { drawSVG: '0%' });
  gsap.set(fls, { scale: 0, transformOrigin: '50% 100%' });
  gsap.set(badge, { scale: 0, rotation: -30 });
  gsap.set(label, { autoAlpha: 0, y: 10 });
  gsap.set(bubble, { autoAlpha: 0, scale: 0.6, transformOrigin: isHtml ? '0% 50%' : '50% 50%' });

  const tl = gsap.timeline({ paused: true, onComplete: () => st.classList.add('is-on') });
  tl.set(st, { autoAlpha: 1 }, 0)
    .to(badge, { scale: 1, rotation: 0, duration: 0.75, ease: 'back.out(1.9)' }, 0)
    .fromTo(ring, { scale: 0.85, opacity: 0.8 }, { scale: 1.55, opacity: 0, duration: 1, ease: 'power2.out', transformOrigin: '50% 50%' }, 0.2)
    .to(ics, { drawSVG: '100%', duration: 0.7, stagger: 0.1, ease: 'power2.inOut' }, 0.3)
    .to(fls, { scale: 1, duration: 0.55, stagger: 0.05, ease: 'back.out(2)' }, 0.45)
    .to(label, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.5)
    .to(bubble, { autoAlpha: 1, scale: 1, duration: 0.75, ease: 'back.out(1.6)' }, 0.65);
  return tl;
}

/* ---------- the vine ---------- */
function runVine(host, { mobile }) {
  if (!host) return undefined;
  const svg = host.querySelector('svg.vine__svg');
  const path = host.querySelector('.vine__path');
  const tip = host.querySelector('.vine__tip');
  const stationEls = q('[data-st]', host);
  if (!svg || !path || !tip) return undefined;

  const ns = 'http://www.w3.org/2000/svg';
  const leafGroup = document.createElementNS(ns, 'g');
  leafGroup.setAttribute('class', 'vine__leaves');
  leafGroup.setAttribute('aria-hidden', 'true');
  path.after(leafGroup);

  let total = 0;
  let lens = [];
  let xs = [];
  let ys = []; // page y of each sample (running maximum, so it only ever goes down the page)
  let leaves = [];
  let stations = stationEls.map((el) => ({ el, tl: buildStation(el), at: 0, on: false }));
  let current = 0;
  let live = false;
  let measured = false; // the drawing is measured the first time it is near the screen, not at page start

  // Phone: the vine is built from where the badges are, so it runs through each of them
  function buildMobilePath() {
    const box = svg.getBoundingClientRect();
    const plantBox = host.querySelector('.vm__plant').getBoundingClientRect();
    const centers = q('.sm__badge', host).map((b) => {
      const r = b.getBoundingClientRect();
      return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
    });
    const startX = plantBox.left + plantBox.width * (161 / 340) - box.left;
    const startY = plantBox.top + plantBox.height * (492 / 680) - box.top;
    const x0 = centers[0][0];
    let d = `M${startX} ${startY}C${startX} ${startY + 80} ${x0} ${centers[0][1] - 110} ${x0} ${centers[0][1]}`;
    for (let i = 0; i < centers.length - 1; i++) {
      const [, y1] = centers[i];
      const [, y2] = centers[i + 1];
      const s = i % 2 ? 1 : -1;
      d += `C${x0 + s * 30} ${y1 + (y2 - y1) * 0.33} ${x0 - s * 30} ${y1 + (y2 - y1) * 0.66} ${x0} ${y2}`;
    }
    path.setAttribute('d', d);
    return centers;
  }

  function measure() {
    const mobileCenters = mobile ? buildMobilePath() : null;
    total = path.getTotalLength();
    path.style.strokeDasharray = `${total}`;
    path.style.strokeDashoffset = `${total - current}`;

    const box = svg.getBoundingClientRect();
    const scale = mobile ? 1 : box.width / 1440;
    const docTop = box.top + window.scrollY;
    const n = Math.max(120, Math.ceil(total / 7));
    lens = [];
    xs = [];
    ys = [];
    let runMax = -Infinity;
    const raw = [];
    for (let i = 0; i <= n; i++) {
      const len = (total * i) / n;
      const p = path.getPointAtLength(len);
      lens.push(len);
      xs.push(p.x);
      raw.push(p.y);
      runMax = Math.max(runMax, docTop + p.y * scale);
      ys.push(runMax);
    }

    // where along the vine each station sits
    stations.forEach((s, i) => {
      const [cx, cy] = mobile ? mobileCenters[i] : [+s.el.dataset.cx, +s.el.dataset.cy];
      let best = 0;
      let bestD = Infinity;
      for (let k = 0; k <= n; k++) {
        const dd = (xs[k] - cx) ** 2 + (raw[k] - cy) ** 2;
        if (dd < bestD) { bestD = dd; best = k; }
      }
      s.at = lens[best];
    });

    // leaves along the vine, one every so often, alternating sides
    leafGroup.replaceChildren();
    const gap = mobile ? 150 : 215;
    const base = mobile ? 0.85 : 1.8;
    leaves = [];
    for (let at = gap * 0.6, i = 0; at < total - 30; at += gap, i++) {
      const p = path.getPointAtLength(at);
      const p2 = path.getPointAtLength(Math.min(total, at + 4));
      const ang = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
      const side = i % 2 ? 1 : -1;
      const g = document.createElementNS(ns, 'path');
      g.setAttribute('d', LEAF);
      g.setAttribute('fill', LEAF_COLORS[i % LEAF_COLORS.length]);
      leafGroup.appendChild(g);
      leaves.push({ el: g, at, x: p.x, y: p.y, rot: ang + side * (48 + (i % 3) * 8), flip: side < 0, size: base * (0.8 + ((i * 37) % 5) * 0.09), k: -1 });
      g.setAttribute('transform', 'scale(0)');
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

  function render(len) {
    path.style.strokeDashoffset = `${total - len}`;

    for (const lf of leaves) {
      const k = Math.round(clamp((len - lf.at) / 110) * 100) / 100;
      if (k === lf.k) continue;
      lf.k = k;
      const s = k <= 0 ? 0 : easeOutBack(k) * lf.size;
      lf.el.setAttribute('transform', `translate(${lf.x} ${lf.y}) rotate(${lf.rot}) scale(${lf.flip ? -s : s} ${s})`);
    }

    // the tip, with its two leaves, rides the end of the vine
    if (len > 0.5 && len < total - 1) {
      const p = path.getPointAtLength(len);
      const p2 = path.getPointAtLength(Math.min(total, len + 3));
      const ang = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
      tip.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ang})${mobile ? ' scale(1.15)' : ' scale(1.7)'}`);
      tip.style.opacity = '1';
    } else {
      tip.style.opacity = '0';
    }

    for (const s of stations) {
      if (!s.on && len >= s.at - 28) {
        s.on = true;
        s.tl.play();
      } else if (s.on && len < s.at - 170) {
        s.on = false;
        s.el.classList.remove('is-on');
        s.tl.reverse();
      }
    }
  }

  function tick() {
    if (!live) return;
    if (!measured) {
      measured = true;
      measure();
    }
    const target = lenAtY(window.scrollY + window.innerHeight * 0.62);
    current += (target - current) * 0.14;
    if (Math.abs(target - current) < 0.05) current = target;
    render(current);
  }

  const onRefresh = () => measured && measure();
  ScrollTrigger.addEventListener('refresh', onRefresh);
  gsap.ticker.add(tick);
  // work only while the section is on (or near) the screen
  const watch = ScrollTrigger.create({
    trigger: svg, // (the wrapper itself has no height on desktop: the drawing inside it is positioned absolutely)
    start: 'top bottom+=300',
    end: 'bottom top-300',
    onToggle: (self) => {
      live = self.isActive;
    },
  });
  live = watch.isActive;

  return () => {
    gsap.ticker.remove(tick);
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    watch.kill();
    stations.forEach((s) => s.tl.kill());
    leafGroup.remove();
    path.style.strokeDasharray = '';
    path.style.strokeDashoffset = '';
  };
}

export function setupVine() {
  const section = document.querySelector('#agri-guide');
  if (!section) return;
  q('.plant', section).forEach(growPlant);

  const mm = gsap.matchMedia();
  mm.add('(min-width: 960px)', () => runVine(section.querySelector('[data-vine="desktop"]'), { mobile: false }));
  mm.add('(max-width: 959px)', () => runVine(section.querySelector('[data-vine="mobile"]'), { mobile: true }));
}
