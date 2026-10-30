// Youth in Agri behavior (the look of each change is in youth.css):
//  - the photo strip slides sideways: drag it with the mouse, scroll it, use the arrows, or the arrow keys when it
//    has focus (touch screens just swipe it)
//  - the expanding frames in "But wait... There's more!": pressing a tall frame opens it and folds the open one into a
//    tall frame (on desktop one is always open). On phones they are an accordion: pressing the open row closes it. The
//    branches of the diagram near the top open their frame and scroll to it.
//  - a YouTube video in the top block is loaded only when the visitor presses play (nothing is fetched before)

import { lenis, isDesktopPointer } from './motion.js';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const wide = window.matchMedia('(min-width: 960px)');

function setupStrip() {
  const track = document.querySelector('.yt-strip__track');
  if (!track) return;
  const step = () => {
    const card = track.querySelector('.yt-card');
    return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : 300;
  };

  document.querySelectorAll('[data-strip]').forEach((button) => {
    button.addEventListener('click', () => track.scrollBy({ left: Number(button.dataset.strip) * step(), behavior: 'smooth' }));
  });

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') track.scrollBy({ left: step(), behavior: 'smooth' });
    else if (event.key === 'ArrowLeft') track.scrollBy({ left: -step(), behavior: 'smooth' });
    else return;
    event.preventDefault();
  });

  // mouse dragging (touch and pen already scroll natively)
  let startX = 0;
  let startLeft = 0;
  let down = false;
  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    down = true;
    startX = event.clientX;
    startLeft = track.scrollLeft;
  });
  window.addEventListener('pointermove', (event) => {
    if (!down) return;
    const dx = event.clientX - startX;
    if (Math.abs(dx) > 4) track.classList.add('is-drag');
    track.scrollLeft = startLeft - dx;
  });
  const release = () => {
    if (!down) return;
    down = false;
    track.classList.remove('is-drag');
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
}

function setupFrames() {
  const frames = Array.from(document.querySelectorAll('[data-frame].yt-frame'));
  if (!frames.length) return;

  // Desktop: the open frame is wide, the next one is a tall frame and the last peeks out from behind it. The "next" one
  // is the neighbour after the open frame (or before it, if the last one is open). On phones the slots are not used.
  const layout = () => {
    const open = frames.findIndex((frame) => frame.classList.contains('is-open'));
    const next = open < 0 ? -1 : open + 1 < frames.length ? open + 1 : open - 1;
    frames.forEach((frame, i) => {
      frame.dataset.slot = i === open ? 'open' : i === next || open < 0 ? 'next' : 'peek';
      delete frame.dataset.flush;
      if (frame.dataset.slot === 'peek' && next >= 0 && Math.abs(i - next) === 1) frame.dataset.flush = i > next ? 'prev' : 'next';
    });
    // the open frame is a little narrower when the sliver is not tucked against the tall frame (two gaps instead of one)
    frames[0].parentElement.dataset.layout = frames.some((frame) => frame.dataset.flush) ? 'flush' : 'gap';
  };

  const set = (frame, open) => {
    frame.classList.toggle('is-open', open);
    frame.querySelector('.yt-frame__tab')?.setAttribute('aria-expanded', String(open));
  };
  const openOnly = (id) => {
    frames.forEach((frame) => set(frame, frame.dataset.frame === id));
    layout();
  };

  // on desktop one frame is always open
  const keepOneOpen = () => {
    if (wide.matches && !frames.some((frame) => frame.classList.contains('is-open'))) openOnly(frames[0].dataset.frame);
  };
  wide.addEventListener('change', keepOneOpen);

  frames.forEach((frame) => {
    frame.querySelector('.yt-frame__tab')?.addEventListener('click', () => {
      const isOpen = frame.classList.contains('is-open');
      if (isOpen && wide.matches) return; // desktop: it is already open
      if (isOpen) {
        set(frame, false);
        layout();
      } else openOnly(frame.dataset.frame);
    });
  });

  // The diagram's partner links open their frame and then scroll to it. The frame that was open closes at the same
  // moment, which can move things, so the scroll waits until that has finished.
  document.querySelectorAll('a[data-frame]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.getElementById(`feature-${link.dataset.frame}`);
      if (!target) return; // without the frame, the link just goes to its address (#more)
      event.preventDefault();
      openOnly(link.dataset.frame);
      setTimeout(() => {
        const y = (wide.matches ? document.getElementById('more') : target).getBoundingClientRect().top + window.scrollY - 96;
        if (lenis) lenis.scrollTo(y);
        else window.scrollTo({ top: y, behavior: reduce.matches || !isDesktopPointer() ? 'auto' : 'smooth' });
      }, reduce.matches ? 0 : 600);
    });
  });

  layout();
}

function setupVideo() {
  const button = document.querySelector('[data-youtube]');
  if (!button) return;
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(button.dataset.youtube)}?autoplay=1&rel=0`;
    frame.title = button.getAttribute('aria-label')?.replace(/^Play video: /, '') || 'Video Feature';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    button.replaceWith(frame);
    frame.focus();
  });
}

// The diagram's two green pills open a vine of buttons.
//   mouse:  hovering the pill opens it; it stays open while the pointer is over the pill or its buttons and closes a
//           moment after the pointer leaves. Pressing the pill pins it open (press again to close).
//   touch / keyboard: pressing (or Enter / Space on) the pill toggles it. Escape closes it; so does a press outside.
// This only changes the state (class is-open, aria-expanded). How it looks is youth.css, and with animations on,
// youth-animations.js listens for "yt:tree-open" / "yt:tree-close" and draws the vine. If nothing there claims the
// close (reduced motion, no animation), the group simply closes at once.
function setupTree() {
  const groups = Array.from(document.querySelectorAll('[data-tree]'));
  if (!groups.length) return;
  const api = new Map();
  // With reduced motion nothing animates, so the whole diagram starts open (still pressable to fold it)
  const startOpen = document.documentElement.classList.contains('rm');

  groups.forEach((group) => {
    const button = group.querySelector('.yt-pill--parent');
    if (startOpen) {
      group.classList.add('is-open');
      group.dataset.state = 'open';
      button.setAttribute('aria-expanded', 'true');
    }
    let pinned = false;
    let hovering = false;
    let timer = 0;
    const isOpen = () => group.classList.contains('is-open') && group.dataset.state !== 'closing';

    const open = () => {
      clearTimeout(timer);
      if (isOpen()) return;
      group.classList.add('is-open');
      group.dataset.state = 'open';
      button.setAttribute('aria-expanded', 'true');
      group.dispatchEvent(new CustomEvent('yt:tree-open'));
    };

    const close = () => {
      clearTimeout(timer);
      pinned = false;
      if (!isOpen()) return;
      button.setAttribute('aria-expanded', 'false');
      group.dataset.state = 'closing';
      // an animation can claim the close (preventDefault) and finish it itself once the vine has pulled back
      const claimed = !group.dispatchEvent(new CustomEvent('yt:tree-close', { cancelable: true }));
      if (!claimed) {
        group.classList.remove('is-open');
        delete group.dataset.state;
      }
    };

    const closeSoon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!pinned && !hovering && !group.matches(':focus-within')) close();
      }, 320);
    };

    api.set(group, { close });

    button.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') open();
    });
    group.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      hovering = true;
      clearTimeout(timer);
    });
    group.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'mouse') return;
      hovering = false;
      closeSoon();
    });

    button.addEventListener('click', () => {
      if (isOpen() && (pinned || !hovering)) close(); // second press, or a press on touch / with the keyboard
      else {
        open();
        pinned = true; // a press while hovering pins it open
      }
    });

    group.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !isOpen()) return;
      close();
      button.focus();
    });

    // keyboard: tabbing out of the group closes it (unless the mouse is on it)
    group.addEventListener('focusout', (event) => {
      if (group.contains(event.relatedTarget)) return;
      pinned = false;
      closeSoon();
    });
  });

  // a press anywhere else closes whatever is open
  document.addEventListener('pointerdown', (event) => {
    groups.forEach((group) => {
      if (!group.contains(event.target)) api.get(group).close();
    });
  });
}

setupStrip();
setupFrames();
setupTree();
setupVideo();
