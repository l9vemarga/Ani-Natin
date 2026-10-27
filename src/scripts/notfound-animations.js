// 404 page motion: the crops grow up one after another, then sway; the farmer swings his hoe, dirt flies and a
// seedling pops up; clouds drift, birds cross, a fish jumps in the pond. The text arrives with the shared
// helpers (data-split / data-reveal / data-pop). Only transforms and opacity are animated.
import { gsap, q, setupReveals, headerEntrance, startMotion } from './motion.js';

const rand = gsap.utils.random;

function growCrops(scene) {
  const grow = q('[data-grow]', scene);
  // left to right, so the field fills in like a wave
  grow.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
  gsap.set(grow, { autoAlpha: 0, scaleY: 0, scaleX: 0.55, transformOrigin: '50% 100%' });
  const start = 0.5;
  gsap.to(grow, {
    autoAlpha: 1,
    scaleX: 1,
    scaleY: 1,
    duration: 0.95,
    ease: 'back.out(1.9)',
    stagger: 0.055,
    delay: start,
  });

  // idle sway, started once each plant is up
  const settle = start + 0.95 + grow.length * 0.055;
  grow.forEach((el) => {
    const tree = el.classList.contains('nf-tree');
    const crate = el.classList.contains('nf-crate');
    if (crate) return;
    gsap.to(el, {
      rotation: tree ? rand(-1.2, 1.2) : rand(-3.2, 3.2),
      duration: rand(2.2, 3.6),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: settle * 0.7 + rand(0, 1.2),
      transformOrigin: '50% 100%',
    });
  });
  q('.nf-fruits', scene).forEach((fruits) => {
    gsap.to(fruits, { y: 2.2, duration: rand(1.2, 1.8), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: rand(0, 1) });
  });

  // a gentle wiggle when the pointer brushes a plant (skew, so it never fights the sway)
  scene.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return;
    const plant = e.target.closest?.('.nf-crop, .nf-tree');
    if (!plant || plant._wiggling) return;
    plant._wiggling = true;
    gsap.fromTo(plant, { skewX: 9 }, { skewX: 0, duration: 1.1, ease: 'elastic.out(1, 0.28)', onComplete: () => (plant._wiggling = false) });
  });
}

function sky(scene) {
  // sun: rays turn slowly, the disc breathes
  gsap.to(q('.nf-rays', scene), { rotation: 360, duration: 70, ease: 'none', repeat: -1, svgOrigin: '0 0' });
  gsap.to(q('.nf-sun', scene), { scale: 1.06, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, svgOrigin: '0 0' });

  // clouds drift right and wrap around
  const span = 1440 + 520;
  q('.nf-cloud', scene).forEach((cloud, index) => {
    const base = cloud.parentNode.transform.baseVal.getItem(0).matrix.e; // where the cloud is drawn
    const t = gsap.fromTo(cloud, { x: -(base + 260) }, { x: 1440 + 260 - base, duration: span / (index ? 17 : 24), ease: 'none', repeat: -1 });
    t.progress((base + 260) / span);
  });

  // birds cross the sky, flapping
  q('.nf-bird', scene).forEach((bird, index) => {
    gsap.to(bird, { x: 1560, duration: 15 - index * 2, ease: 'none', repeat: -1, repeatDelay: 5 + index * 3, delay: 2.2 + index * 3.4 });
    gsap.to(bird, { y: `+=${index ? 10 : 16}`, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(q('.nf-wing', bird), { scaleY: 0.3, duration: 0.24, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 100%' });
  });
}

function pond(scene) {
  const fish = q('.nf-fish', scene)[0];
  const ripple = q('.nf-ripple', scene)[0];
  if (!fish || !ripple) return;
  gsap.set(fish, { autoAlpha: 0 });
  gsap.set(ripple, { autoAlpha: 0, transformOrigin: '50% 50%' });
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 3.4, delay: 3 });
  tl.set(fish, { x: -34, y: 8, rotation: -58, autoAlpha: 1 }, 0)
    .fromTo(ripple, { scale: 0.3, autoAlpha: 1, x: -34 }, { scale: 2.6, autoAlpha: 0, duration: 0.9, ease: 'power1.out' }, 0)
    .to(fish, { x: 30, duration: 1.1, ease: 'none' }, 0)
    .to(fish, { y: -64, duration: 0.55, ease: 'power2.out' }, 0)
    .to(fish, { y: 8, duration: 0.55, ease: 'power2.in' }, 0.55)
    .to(fish, { rotation: 58, duration: 1.1, ease: 'sine.inOut' }, 0)
    .set(fish, { autoAlpha: 0 }, 1.1)
    .fromTo(ripple, { scale: 0.3, autoAlpha: 1, x: 30 }, { scale: 2.6, autoAlpha: 0, duration: 0.9, ease: 'power1.out' }, 1.1);
}

function farmer(scene) {
  const arms = q('.nf-arms', scene)[0];
  const torso = q('.nf-torso', scene)[0];
  const head = q('.nf-head', scene)[0];
  const body = q('.nf-farmer', scene)[0];
  const plant = q('.nf-plant', scene)[0];
  const hole = q('.nf-hole', scene)[0];
  const dirt = q('.nf-dirt circle', scene);
  if (!arms || !torso || !head || !body) return;

  // resting pose; the pivots are the shoulder, the hips and the neck
  gsap.set(arms, { rotation: -22, svgOrigin: '8 -180' });
  gsap.set(torso, { rotation: 3, svgOrigin: '0 -98' });
  gsap.set(head, { rotation: 0, svgOrigin: '4 -192' });
  gsap.set(plant, { scale: 0, transformOrigin: '50% 100%' });
  gsap.set(dirt, { autoAlpha: 0 });
  gsap.set(hole, { transformOrigin: '50% 50%' });

  // dirt flies out of the hole
  const burst = () => {
    gsap.fromTo(hole, { scaleX: 1.6, scaleY: 2 }, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)' });
    dirt.forEach((bit) => {
      const dx = +bit.dataset.dx;
      const dy = +bit.dataset.dy;
      gsap
        .timeline()
        .set(bit, { x: 0, y: -4, autoAlpha: 1, scale: 1 })
        .to(bit, { x: dx * 1.5, duration: 0.75, ease: 'power1.out' }, 0)
        .to(bit, { y: dy, duration: 0.3, ease: 'power2.out' }, 0)
        .to(bit, { y: 10, duration: 0.45, ease: 'power2.in' }, 0.3)
        .to(bit, { autoAlpha: 0, scale: 0.4, duration: 0.2 }, 0.58);
    });
  };

  const tl = gsap.timeline({ repeat: -1, delay: 1.6 });
  tl
    // the seedling sinks back, the hoe goes up
    .to(plant, { scale: 0, duration: 0.35, ease: 'back.in(2)' }, 0)
    .to(arms, { rotation: -68, duration: 1, ease: 'power2.inOut' }, 0)
    .to(torso, { rotation: -5, duration: 1, ease: 'power2.inOut' }, 0)
    .to(head, { rotation: -4, duration: 1, ease: 'power2.inOut' }, 0)
    .to(body, { y: -5, duration: 1, ease: 'power2.inOut' }, 0)
    // a tiny wind-up, then the swing
    .to(arms, { rotation: -76, duration: 0.2, ease: 'power1.out' }, 1)
    .to(arms, { rotation: 6, duration: 0.27, ease: 'power3.in' }, 1.2)
    .to(torso, { rotation: 14, duration: 0.27, ease: 'power3.in' }, 1.2)
    .to(head, { rotation: 6, duration: 0.27, ease: 'power3.in' }, 1.2)
    .to(body, { y: 2, duration: 0.27, ease: 'power3.in' }, 1.2)
    .add(burst, 1.47)
    // recoil, the seedling pops up
    .to(arms, { rotation: -3, duration: 0.35, ease: 'power2.out' }, 1.52)
    .to(body, { y: 0, duration: 0.35, ease: 'power2.out' }, 1.52)
    .to(plant, { scale: 1, duration: 0.8, ease: 'back.out(2.4)' }, 1.62)
    // a moment to admire it, then back to the resting pose
    .to(arms, { rotation: -22, duration: 0.8, ease: 'power2.inOut' }, 2.6)
    .to(torso, { rotation: 3, duration: 0.8, ease: 'power2.inOut' }, 2.6)
    .to(head, { rotation: 0, duration: 0.8, ease: 'power2.inOut' }, 2.6)
    .to({}, { duration: 0.4 }, 3.4); // pause before the next swing
}

startMotion(() => {
  headerEntrance();
  setupReveals();
  const scene = document.querySelector('.nf-scene');
  if (!scene) return;
  growCrops(scene);
  sky(scene);
  pond(scene);
  farmer(scene);
});
