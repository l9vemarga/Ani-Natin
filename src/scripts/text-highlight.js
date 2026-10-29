// A scroll-driven "highlight" for a statement, in the style of two26.studio: the whole text is there from the
// start but faded, and as the visitor scrolls a sweep runs through it letter by letter. Letters behind the sweep
// are solid, the few at its leading edge glow in an accent color, and the ones ahead of it are still faded.
//
//   const highlight = createHighlight(element);
//   highlight.apply(0.4); // 0 = everything faded, 1 = everything solid; call it from a scrubbed tween
//
// It is deterministic (the same number always gives the same picture), so scrolling back up un-highlights it.
// Each letter keeps its own final color (cream, or yellow inside a span that is yellow), read from the page.
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

const clamp = (v) => Math.min(1, Math.max(0, v));

export function createHighlight(el, { edge = '#de6822', edgeOnMark = '#e5dc72', fade = 0.26, soft = 9 } = {}) {
  // words wrap as units, and the letters inside them are what changes color
  const split = SplitText.create(el, { type: 'words,chars', aria: 'none' });
  const letters = split.chars.map((node) => {
    const [r, g, b] = (getComputedStyle(node).color.match(/[\d.]+/g) || [250, 228, 188]).slice(0, 3).map(Number);
    return {
      node,
      base: `rgb(${r},${g},${b})`,
      faded: `rgba(${r},${g},${b},${fade})`,
      // on the orange highlight block, orange would vanish, so the edge there is yellow
      edge: node.closest('.mark') ? edgeOnMark : edge,
      shown: -1,
    };
  });
  letters.forEach((l) => (l.node.style.color = l.faded));

  const n = letters.length;
  const mix = gsap.utils.interpolate;

  function apply(t) {
    const head = clamp(t) * (n + soft); // where the sweep is, counted in letters
    for (let i = 0; i < n; i++) {
      const l = letters[i];
      const u = Math.round(clamp((head - i) / soft) * 50) / 50; // 0 not reached yet, 1 fully revealed
      if (u === l.shown) continue;
      l.shown = u;
      // faded -> edge color as the sweep arrives, then edge color -> the letter's own color as it moves on
      l.node.style.color = u < 0.3 ? mix(l.faded, l.edge, u / 0.3) : mix(l.edge, l.base, (u - 0.3) / 0.7);
    }
  }

  return { apply };
}
