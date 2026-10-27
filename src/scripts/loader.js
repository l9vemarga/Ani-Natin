// Loading screen animation (markup: src/components/Loader.astro).
// 1. A carrot-shaped brush hops in and writes "Ani Natin": it follows two zig-zag strokes, one per row
//    of letters, and the letters show wherever it has been. Then it hops away.
// 2. Vines, leaves and flowers grow out of the wordmark while the vines in the background sway.
// 3. Once the page is ready (and the animation has had its few seconds) the wordmark lifts away, the
//    sprouts shrink back, and the vine rows pull away to alternate sides, starting from the middle row,
//    thinning as they go. The intro underneath is released halfway through.
// Clicking or pressing a key skips ahead to the end of step 2.
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { openLoader } from './loader-gate.js';

const root = document.documentElement;
const loader = document.querySelector('[data-loader]');

function finish() {
  loader?.remove();
  root.classList.remove('loader-on', 'loader-opening');
  root.classList.add('loader-done');
  openLoader();
}

function run() {
  gsap.registerPlugin(DrawSVGPlugin);
  const q = (selector) => Array.from(loader.querySelectorAll(selector));
  const rows = q('.vine-row');
  const veins = q('.vein');
  const stalks = q('.stalk');
  const pops = q('.pop');
  const sweeps = q('.wm-sweep');
  const word = loader.querySelector('.loader__word');
  const carrot = loader.querySelector('.carrot');
  const center = loader.querySelector('.loader__center');

  // Start states
  gsap.set(center, { autoAlpha: 1 });
  gsap.set(sweeps, { drawSVG: '0%' });
  gsap.set(veins, { drawSVG: '0%' });
  gsap.set(stalks, { drawSVG: '0%', strokeWidth: 0 });
  pops.forEach((node) => gsap.set(node, { scale: 0, svgOrigin: `${node.dataset.x} ${node.dataset.y}` }));

  // The brush. Its tip is the carrot's origin, so it is placed with a plain transform.
  const first = sweeps[0].getPointAtLength(0);
  const pen = { x: first.x, y: first.y, lift: 0, rot: 26, s: 0 };
  const place = () => carrot.setAttribute('transform', `translate(${pen.x} ${pen.y + pen.lift}) rotate(${pen.rot}) scale(${pen.s})`);
  place();

  // One stroke: the brush follows the path and the mask draws along with it
  const write = (path, duration) => {
    const length = path.getTotalLength();
    const stroke = { p: 0 }; // each stroke has its own progress
    return gsap.to(stroke, {
      p: 1,
      duration,
      ease: 'power1.inOut',
      onUpdate: () => {
        const point = path.getPointAtLength(stroke.p * length);
        pen.x = point.x;
        pen.y = point.y;
        pen.rot = 26 + 7 * Math.sin(stroke.p * Math.PI * 12); // a little wiggle as it paints
        gsap.set(path, { drawSVG: `0% ${stroke.p * 100}%` });
        place();
      },
    });
  };
  const second = sweeps[1].getPointAtLength(0);

  const arrive = gsap.timeline();
  arrive
    // the thin background vines draw in
    .to(veins, { drawSVG: '100%', duration: 1.5, ease: 'power2.inOut', stagger: 0.12 }, 0)
    // the carrot pops in at the start of the first stroke
    .to(pen, { s: 1, duration: 0.5, ease: 'back.out(2.2)', onUpdate: place }, 0.2)
    // writes "ani"
    .add(write(sweeps[0], 1.3), 0.6)
    // hops over to the start of "natin"
    .to(pen, { lift: -140, duration: 0.2, ease: 'power2.out', onUpdate: place }, 1.95)
    .to(pen, { x: second.x, y: second.y, rot: 18, duration: 0.4, ease: 'power2.inOut', onUpdate: place }, 1.95)
    .to(pen, { lift: 0, duration: 0.2, ease: 'power2.in', onUpdate: place }, 2.15)
    // writes "natin"
    .add(write(sweeps[1], 1.6), 2.35)
    // the carrot bounces off
    .to(pen, { lift: -260, rot: 70, s: 0, duration: 0.5, ease: 'back.in(2)', onUpdate: place }, 3.95)
    // vines climb out of the letters, then leaves, flowers and sparkles pop open
    .to(stalks, { drawSVG: '100%', strokeWidth: 6, duration: 0.7, ease: 'power2.out', stagger: 0.09 }, 3.3)
    .to(pops, { scale: 1, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.05 }, 3.7);

  const arrived = new Promise((resolve) => arrive.eventCallback('onComplete', resolve));

  // Things breathe while waiting
  const idle = [gsap.to(rows, { x: (i) => (i % 2 ? 16 : -16), duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })];
  let sway = [];
  arrived.then(() => {
    idle.push(gsap.to(word, { scale: 1.02, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' }));
    sway = pops.map((node, i) =>
      gsap.to(node, { rotation: (i % 2 ? 1 : -1) * gsap.utils.random(3, 6), duration: gsap.utils.random(0.6, 0.95), ease: 'sine.inOut', yoyo: true, repeat: -1 }),
    );
  });

  // Click or any key: jump to the end of the writing
  const skip = () => arrive.progress(1);
  loader.addEventListener('click', skip, { once: true });
  window.addEventListener('keydown', skip, { once: true });

  // Wait for the page, then open
  const ready = new Promise((resolve) => {
    if (root.classList.contains('anim-ready') || root.classList.contains('anim-fail')) return resolve();
    window.addEventListener('ani:ready', resolve, { once: true });
    setTimeout(resolve, 7000);
  });
  const hold = arrived.then(() => new Promise((resolve) => setTimeout(resolve, 600)));

  Promise.all([hold, ready]).then(() => {
    if (root.classList.contains('anim-fail')) return finish();
    [...idle, ...sway].forEach((t) => t.kill());
    root.classList.add('loader-opening');
    gsap.set(word, { scale: 1 });

    const out = gsap.timeline({ onComplete: finish });
    out
      .to(word, { scale: 1.18, autoAlpha: 0, y: -30, duration: 0.5, ease: 'power2.in' }, 0)
      .to(veins, { autoAlpha: 0, duration: 0.35 }, 0)
      .to(stalks, { drawSVG: '100% 100%', strokeWidth: 0, duration: 0.45, ease: 'power2.in', stagger: 0.03 }, 0)
      .to(pops, { scale: 0, rotation: 0, duration: 0.35, ease: 'back.in(2)', stagger: 0.02 }, 0);

    const middle = (rows.length - 1) / 2;
    rows.forEach((row, i) => {
      out.to(
        row,
        {
          drawSVG: i % 2 ? '0% 0%' : '100% 100%', // alternate rows leave to opposite sides
          x: 0,
          strokeWidth: 20,
          duration: 1.2,
          ease: 'power3.inOut',
        },
        0.3 + Math.abs(i - middle) * 0.08,
      );
    });
    out.call(openLoader, null, 0.95); // the intro starts moving while the vines are still leaving
  });
}

if (loader && root.classList.contains('loader-on')) run();
else openLoader();
