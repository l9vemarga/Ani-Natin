// About page behavior (no animation library needed; the look of every change is in about.css):
//  - Objectives: hovering, focusing or tapping a card makes it the active one and shows its video or image on the
//    stage under the cards (a video plays while it is shown and rests when it is not).
//  - Mission / Vision: the two tilted tabs are real tabs (click, or the arrow keys); the one chosen comes to the front
//    and its statement fades in.

function setupObjectives() {
  const cards = Array.from(document.querySelectorAll('[data-objective]'));
  const media = Array.from(document.querySelectorAll('[data-media]'));
  if (!cards.length || !media.length) return;

  const show = (id) => {
    cards.forEach((card) => {
      const on = card.dataset.objective === id;
      card.classList.toggle('is-on', on);
      card.querySelector('.ab-card__tab')?.setAttribute('aria-pressed', String(on));
    });
    media.forEach((item) => {
      const on = item.dataset.media === id;
      item.classList.toggle('is-on', on);
      item.setAttribute('aria-hidden', String(!on));
      const video = item.querySelector('video');
      if (!video) return;
      if (on) {
        video.preload = 'auto';
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  };

  cards.forEach((card) => {
    const id = card.dataset.objective;
    card.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') show(id); // touch and pen use the tap below
    });
    card.addEventListener('focusin', () => show(id));
    card.addEventListener('click', () => show(id));
  });
}

function setupTabs() {
  const tabs = Array.from(document.querySelectorAll('.ab-tab'));
  const panels = Array.from(document.querySelectorAll('[data-panel]'));
  if (!tabs.length) return;

  const select = (name, focus = false) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    panels.forEach((panel) => panel.classList.toggle('is-on', panel.dataset.panel === name));
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => select(tab.dataset.tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      // only two tabs, so any of these keys moves to the other one
      select(tab.dataset.tab === 'mission' ? 'vision' : 'mission', true);
    });
  });
}

setupObjectives();
setupTabs();
