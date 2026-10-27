// Community page behavior: the top search, the Testimonials / Discussion Forum tabs, the forum itself,
// the FAQ accordion and the school locator. Nothing here needs the animation script: if it is missing or
// off (reduced motion), everything still works, just without the movement.
//
// The forum only talks to forum-api.js (sample data now, the real API later: see BACKEND.md).
// All text from visitors is put on the page with textContent, never as HTML.
import Fuse from 'fuse.js';
import { gsap, root, q } from './motion.js';
import { communityConfig as cfg } from '../data/community.config.js';
import { categories, faq } from '../data/community-content.js';
import schoolData from '../data/schools.json';
import { listPosts, getThread, createPost, createReply, ForumError, validatePost } from './forum-api.js';

const $ = (selector, scope = document) => scope.querySelector(selector);
const motion = () => !root.classList.contains('rm') && !root.classList.contains('anim-fail');
const categoryLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]));

/** Small safe element builder. Text always goes in as text. */
function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === false || value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  kids.flat().forEach((kid) => kid != null && node.append(kid));
  return node;
}

function timeAgo(iso) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 90) return 'Just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

const chevron = () => {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '3');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('cm-topic__chev');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M6 9l6 6 6-6');
  svg.append(path);
  return svg;
};

/** Items arrive with a gentle stagger (skipped when motion is off) */
function arrive(nodes) {
  if (!motion() || !nodes.length) return;
  gsap.fromTo(nodes, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07, clearProps: 'transform,opacity,visibility' });
}

/* =====================================================================
   Tabs: Testimonials / Discussion Forum
   ===================================================================== */
const tabs = q('.cm-card[data-tab]');
const panels = { forum: $('#panel-forum'), testimonials: $('#panel-testimonials') };
const hub = $('#forum-and-testimonials');

function selectTab(name, { animate = true } = {}) {
  tabs.forEach((tab) => {
    const on = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
  });
  Object.entries(panels).forEach(([key, panel]) => {
    if (key !== name) {
      panel.hidden = true;
      return;
    }
    const wasHidden = panel.hidden;
    panel.hidden = false;
    if (wasHidden && animate && motion()) {
      gsap.fromTo(panel, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity,visibility' });
      arrive(q('.cm-quote, .cm-topic', panel));
    }
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab.dataset.tab));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next.dataset.tab);
    next.focus();
  });
});

/* =====================================================================
   Forum
   ===================================================================== */
const listEl = $('#forum-list');
const emptyEl = $('#forum-empty');
const moreBtn = $('#forum-more');
const sampleNote = $('#forum-sample');
const forumQ = $('#forum-q');
const state = { category: 'all', q: '', offset: 0, limit: 6, total: 0, token: 0 };

const PENDING_KEY = 'aninatin.pending';
const NICK_KEY = 'aninatin.nick';
const pendingPosts = () => store.get(PENDING_KEY, []).filter((p) => Date.now() - p.t < 3 * 86400000);

function meta(...parts) {
  return el('span', { class: 'cm-topic__meta' }, parts);
}

function topicItem(post) {
  const panelId = `thread-${post.id}`;
  const button = el(
    'button',
    { class: 'cm-topic__btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': panelId },
    el('span', { class: 'cm-topic__title', text: post.title }),
    el('span', { class: 'cm-topic__side' }, el('span', { text: `${post.replyCount} ${post.replyCount === 1 ? 'reply' : 'replies'}` }), chevron()),
    meta(
      el('span', { class: 'cm-cat', text: categoryLabel[post.category] || post.category }),
      el('span', { text: `by ${post.nickname}` }),
      el('span', { text: `Last activity ${timeAgo(post.lastActivity)}` }),
      cfg.showSampleTags && post.sample ? el('span', { class: 'cm-tag', text: 'Sample' }) : null,
    ),
  );
  const thread = el('div', { class: 'cm-thread', id: panelId, role: 'region', 'aria-label': post.title });
  const item = el('li', { class: 'cm-topic', 'data-id': post.id }, button, el('div', { class: 'cm-open' }, el('div', {}, thread)));
  let loaded = false;

  button.addEventListener('click', async () => {
    const open = !item.classList.contains('is-open');
    q('.cm-topic.is-open', listEl).forEach((other) => {
      if (other === item) return;
      other.classList.remove('is-open');
      $('.cm-topic__btn', other).setAttribute('aria-expanded', 'false');
    });
    item.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    if (open && !loaded) {
      loaded = true;
      thread.append(el('p', { class: 'cm-status', text: 'Kinukuha ang usapan…' }));
      try {
        const data = await getThread(post.id);
        thread.replaceChildren(...threadContent(data.post, data.replies));
      } catch (error) {
        loaded = false;
        thread.replaceChildren(el('p', { class: 'cm-status', 'data-state': 'error', text: error.message || 'Hindi makuha ang usapan.' }));
      }
    }
  });
  return item;
}

function threadContent(post, replies) {
  return [
    el('p', { class: 'cm-thread__body', text: post.body }),
    el('p', { class: 'cm-thread__by', text: `Posted by ${post.nickname} · ${timeAgo(post.createdAt)}` }),
    replies.length
      ? el(
          'ul',
          { class: 'cm-replies', 'aria-label': 'Replies' },
          replies.map((r) => el('li', { class: 'cm-reply' }, el('b', { text: r.nickname }), el('span', { class: 'cm-reply__when', text: ` · ${timeAgo(r.createdAt)}` }), el('br'), document.createTextNode(r.body))),
        )
      : el('p', { class: 'cm-thread__by', text: 'Wala pang sagot. Ikaw na ang mauna!' }),
    replyForm(post),
  ];
}

function replyForm(post) {
  const lim = cfg.limits;
  const uid = `r-${post.id}`;
  const status = el('p', { class: 'cm-status', role: 'status', 'aria-live': 'polite' });
  const nick = el('input', { id: `${uid}-nick`, name: 'nickname', type: 'text', maxlength: lim.nickname, autocomplete: 'off', value: store.get(NICK_KEY, '') });
  const body = el('textarea', { id: `${uid}-body`, name: 'body', rows: '3', maxlength: lim.reply });
  const trap = el('input', { type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off' });
  const submit = el('button', { class: 'pill-btn pill-btn--lime', type: 'submit', text: 'Mag-reply' });
  const form = el(
    'form',
    { class: 'cm-reply-form', novalidate: true },
    el('p', { class: 'cm-field' }, el('label', { for: `${uid}-body`, text: 'Ang sagot mo' }), body),
    el('p', { class: 'cm-field' }, el('label', { for: `${uid}-nick`, text: 'Nickname' }), nick),
    el('p', { class: 'cm-hp', 'aria-hidden': 'true' }, el('label', {}, 'Website ', trap)),
    el('div', { class: 'cm-reply-form__row' }, submit, status),
    el('p', { class: 'cm-moderation', text: 'Dumadaan sa review ang reply bago ito lumabas. Walang email na kinokolekta.' }),
  );
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.dataset.state = '';
    const data = { nickname: nick.value, body: body.value, website: trap.value };
    const problem = validatePost(data, 'reply');
    if (problem) {
      status.dataset.state = 'error';
      status.textContent = problem.message;
      (problem.field === 'nickname' ? nick : body).focus();
      return;
    }
    submit.disabled = true;
    status.textContent = 'Ipinapadala…';
    try {
      await createReply(post.id, data);
      store.set(NICK_KEY, nick.value.trim());
      body.value = '';
      status.dataset.state = 'ok';
      status.textContent = 'Salamat! Lalabas ang reply mo kapag na-review na.';
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error instanceof ForumError ? error.message : 'May problema. Subukan ulit.';
    } finally {
      submit.disabled = false;
    }
  });
  return form;
}

function pendingItem(post) {
  return el(
    'li',
    { class: 'cm-topic cm-topic--pending', 'data-id': post.id },
    el(
      'div',
      { class: 'cm-topic__btn', style: 'cursor:default' },
      el('span', { class: 'cm-topic__title', text: post.title }),
      el('span', { class: 'cm-topic__side' }, el('span', { class: 'cm-badge', text: 'Naghihintay ng review' })),
      meta(el('span', { class: 'cm-cat', text: categoryLabel[post.category] || post.category }), el('span', { text: `by ${post.nickname}` }), el('span', { text: 'Ikaw lang ang nakakakita nito hanggang ma-approve.' })),
    ),
  );
}

async function loadPosts({ append = false } = {}) {
  const token = ++state.token;
  listEl.setAttribute('aria-busy', 'true');
  if (!append) {
    listEl.replaceChildren(el('li', { class: 'cm-skeleton' }), el('li', { class: 'cm-skeleton' }), el('li', { class: 'cm-skeleton' }));
    emptyEl.hidden = true;
    moreBtn.hidden = true;
  }
  try {
    const { posts, total } = await listPosts({ category: state.category, q: state.q, limit: state.limit, offset: append ? state.offset : 0 });
    if (token !== state.token) return; // a newer request replaced this one
    state.total = total;
    state.offset = (append ? state.offset : 0) + posts.length;
    if (!append) listEl.replaceChildren();

    const added = [];
    if (!append && !state.q) {
      pendingPosts()
        .filter((p) => state.category === 'all' || p.category === state.category)
        .forEach((p) => added.push(pendingItem(p)));
    }
    posts.forEach((p) => added.push(topicItem(p)));
    listEl.append(...added);
    arrive(added);

    emptyEl.hidden = listEl.children.length > 0;
    moreBtn.hidden = state.offset >= state.total;
    sampleNote.hidden = !(cfg.showSampleTags && cfg.mode === 'mock');
  } catch (error) {
    if (token !== state.token) return;
    listEl.replaceChildren(
      el('li', { class: 'cm-empty' }, el('p', { text: error.message || 'Hindi makuha ang mga topic ngayon.' }), el('button', { class: 'cm-link', type: 'button', text: 'Subukan ulit', onclick: () => loadPosts() })),
    );
  } finally {
    if (token === state.token) listEl.setAttribute('aria-busy', 'false');
  }
}

$('.cm-chips').addEventListener('click', (event) => {
  const chip = event.target.closest('.cm-chip');
  if (!chip) return;
  q('.cm-chip').forEach((c) => {
    const on = c === chip;
    c.classList.toggle('is-on', on);
    c.setAttribute('aria-pressed', String(on));
  });
  state.category = chip.dataset.cat;
  loadPosts();
});

let forumTimer;
forumQ.addEventListener('input', () => {
  clearTimeout(forumTimer);
  forumTimer = setTimeout(() => {
    state.q = forumQ.value;
    loadPosts();
  }, 250);
});

moreBtn.addEventListener('click', () => loadPosts({ append: true }));

/* ---------- "Ask a question" ---------- */
const dialog = $('#ask-dialog');
const askForm = $('#ask-form');
const askDone = $('#ask-done');
const askStatus = $('#ask-status');
const askSubmit = $('#ask-submit');
const askOpen = $('#ask-open');

function updateCounts() {
  q('[data-count]', askForm).forEach((node) => {
    const field = askForm.elements[node.dataset.count];
    const max = +node.dataset.max;
    node.textContent = field.value.length > max * 0.7 ? `${field.value.length}/${max}` : '';
  });
}

function showError(field, message) {
  const node = $(`[data-err="${field}"]`, askForm);
  if (node) node.textContent = message;
  const input = askForm.elements[field];
  if (input) {
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }
}

function clearErrors() {
  q('[data-err]', askForm).forEach((node) => (node.textContent = ''));
  q('[aria-invalid]', askForm).forEach((node) => node.removeAttribute('aria-invalid'));
  askStatus.textContent = '';
  askStatus.dataset.state = '';
}

askOpen.addEventListener('click', () => {
  askForm.hidden = false;
  askDone.hidden = true;
  askForm.reset();
  askForm.elements.nickname.value = store.get(NICK_KEY, '');
  if (state.category !== 'all') askForm.elements.category.value = state.category;
  clearErrors();
  updateCounts();
  dialog.showModal();
  askForm.elements.category.focus();
});

dialog.addEventListener('click', (event) => {
  if (event.target === dialog || event.target.closest('[data-close]')) dialog.close(); // backdrop or a close button
});
dialog.addEventListener('close', () => askOpen.focus());
askForm.addEventListener('input', (event) => {
  updateCounts();
  const node = $(`[data-err="${event.target.name}"]`, askForm);
  if (node) node.textContent = '';
  event.target.removeAttribute?.('aria-invalid');
});

askForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearErrors();
  const data = Object.fromEntries(new FormData(askForm));
  const problem = validatePost(data, 'post');
  if (problem) {
    showError(problem.field, problem.message);
    return;
  }
  askSubmit.disabled = true;
  askStatus.textContent = 'Ipinapadala…';
  try {
    const result = await createPost(data);
    store.set(NICK_KEY, data.nickname.trim());
    if (!data.website) {
      store.set(PENDING_KEY, [{ id: result.id || `pending-${Date.now()}`, title: data.title.trim(), category: data.category, nickname: data.nickname.trim(), t: Date.now() }, ...pendingPosts()].slice(0, 5));
    }
    askForm.hidden = true;
    askDone.hidden = false;
    $('button', askDone).focus();
    selectTab('forum', { animate: false });
    // show the whole list again, so the visitor sees their post waiting for review
    state.category = 'all';
    state.q = '';
    forumQ.value = '';
    q('.cm-chip').forEach((c) => {
      const on = c.dataset.cat === 'all';
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', String(on));
    });
    loadPosts();
  } catch (error) {
    askStatus.dataset.state = 'error';
    if (error instanceof ForumError && error.code === 'invalid' && error.field) {
      askStatus.textContent = '';
      showError(error.field, error.message);
    } else {
      askStatus.textContent = error instanceof ForumError ? error.message : 'May problema. Subukan ulit.';
    }
  } finally {
    askSubmit.disabled = false;
  }
});

/* =====================================================================
   FAQ accordion
   ===================================================================== */
const accItems = q('.cm-acc__item');
function setFaq(item, open) {
  item.classList.toggle('is-open', open);
  $('.cm-acc__btn', item).setAttribute('aria-expanded', String(open));
}
accItems.forEach((item) => {
  $('.cm-acc__btn', item).addEventListener('click', () => {
    const open = !item.classList.contains('is-open');
    accItems.forEach((other) => other !== item && setFaq(other, false));
    setFaq(item, open);
  });
});
function openFaq(id, scroll = true) {
  const button = document.getElementById(`faq-${id}`);
  if (!button) return;
  const item = button.closest('.cm-acc__item');
  accItems.forEach((other) => setFaq(other, other === item));
  if (scroll) item.scrollIntoView({ behavior: motion() ? 'smooth' : 'auto', block: 'center' });
}

/* =====================================================================
   School locator (a list file searched in the browser with Fuse.js)
   ===================================================================== */
const schools = schoolData.schools;
const fType = $('#f-type');
const fProvince = $('#f-province');
const fCity = $('#f-city');
const fQ = $('#f-q');
const foundList = $('#found-list');
const foundCount = $('#found-count');
const foundEmpty = $('#found-empty');
const foundMore = $('#found-more');
const foundSample = $('#found-sample');
const finder = $('#finder');
const found = { results: [], shown: 0, step: 6 };

function fillCities() {
  const province = fProvince.value;
  fCity.replaceChildren();
  if (!province) {
    fCity.disabled = true;
    fCity.append(el('option', { value: '', text: 'Pumili muna ng probinsya' }));
    return;
  }
  const cities = [...new Set(schools.filter((s) => s.province === province).map((s) => s.city))].sort((a, b) => a.localeCompare(b));
  fCity.disabled = false;
  fCity.append(el('option', { value: '', text: 'Lahat ng lungsod' }), ...cities.map((c) => el('option', { value: c, text: c })));
}

function mapsUrl(school) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${school.name} ${school.city} ${school.province}`)}`;
}

function resultItem(school) {
  return el(
    'li',
    { class: 'cm-result' },
    el('span', { class: 'cm-result__name', text: school.name }),
    el('span', { class: 'cm-result__row' }, el('span', { class: 'cm-result__chip', text: school.type }), el('span', { text: `${school.city}, ${school.province}` }), cfg.showSampleTags && school.sample ? el('span', { class: 'cm-tag', text: 'Sample' }) : null),
    el('span', { class: 'cm-result__programs', text: school.programs.join(' · ') }),
    el('a', { class: 'cm-result__map', href: mapsUrl(school), target: '_blank', rel: 'noopener noreferrer', text: 'Buksan sa Google Maps ↗' }),
  );
}

function showMoreResults(animate = true) {
  const next = found.results.slice(found.shown, found.shown + found.step).map(resultItem);
  found.shown += next.length;
  foundList.append(...next);
  if (animate) arrive(next);
  foundMore.hidden = found.shown >= found.results.length;
}

function runSearch() {
  let results = schools.filter((s) => (!fType.value || s.type === fType.value) && (!fProvince.value || s.province === fProvince.value) && (!fCity.value || s.city === fCity.value));
  const text = fQ.value.trim();
  if (text) results = new Fuse(results, { keys: ['name', 'programs', 'city'], threshold: 0.35, ignoreLocation: true }).search(text).map((r) => r.item);
  found.results = results;
  found.shown = 0;
  foundList.replaceChildren();
  foundCount.textContent = `Results: ${results.length} ${results.length === 1 ? 'school' : 'schools'}`;
  foundEmpty.hidden = results.length > 0;
  foundSample.hidden = !(cfg.showSampleTags && results.some((s) => s.sample));
  showMoreResults();
}

fProvince.addEventListener('change', () => {
  fillCities();
  runSearch();
});
fType.addEventListener('change', runSearch);
fCity.addEventListener('change', runSearch);
let schoolTimer;
fQ.addEventListener('input', () => {
  clearTimeout(schoolTimer);
  schoolTimer = setTimeout(runSearch, 200);
});
finder.addEventListener('submit', (event) => {
  event.preventDefault();
  runSearch();
});
finder.addEventListener('reset', () => setTimeout(() => {
  fillCities();
  runSearch();
}));
foundMore.addEventListener('click', () => showMoreResults());

/* =====================================================================
   The big search at the top: forum topics, FAQ and schools
   ===================================================================== */
const sForm = $('#cm-search-form');
const sInput = $('#cm-search-input');
const sBox = $('#cm-results');
const faqFuse = new Fuse(faq, { keys: ['q', 'a'], threshold: 0.35, ignoreLocation: true });
const schoolFuse = new Fuse(schools, { keys: ['name', 'city', 'province', 'programs'], threshold: 0.35, ignoreLocation: true });
let sToken = 0;
let sTimer;
let sOptions = [];
let sActive = -1;

function closeResults() {
  sBox.hidden = true;
  sInput.setAttribute('aria-expanded', 'false');
  sInput.removeAttribute('aria-activedescendant');
  sActive = -1;
}

function setActive(index) {
  sOptions.forEach((o, i) => o.node.setAttribute('aria-selected', String(i === index)));
  sActive = index;
  const active = sOptions[index];
  if (active) {
    sInput.setAttribute('aria-activedescendant', active.node.id);
    active.node.scrollIntoView({ block: 'nearest' });
  } else {
    sInput.removeAttribute('aria-activedescendant');
  }
}

async function chooseResult(option) {
  closeResults();
  if (option.kind === 'faq') {
    openFaq(option.id);
  } else if (option.kind === 'school') {
    fType.value = '';
    fProvince.value = '';
    fillCities();
    fQ.value = option.name;
    runSearch();
    $('#school-locator').scrollIntoView({ behavior: motion() ? 'smooth' : 'auto', block: 'start' });
  } else {
    selectTab('forum', { animate: false });
    q('.cm-chip').forEach((c) => {
      const on = c.dataset.cat === 'all';
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', String(on));
    });
    state.category = 'all';
    state.q = option.title;
    forumQ.value = option.title;
    await loadPosts();
    hub.scrollIntoView({ behavior: motion() ? 'smooth' : 'auto', block: 'start' });
    const item = q('.cm-topic', listEl).find((node) => node.dataset.id === option.id);
    if (item) $('.cm-topic__btn', item).click();
  }
}

async function searchEverything() {
  const text = sInput.value.trim();
  const token = ++sToken;
  if (text.length < 2) {
    closeResults();
    return;
  }
  let forumHits = [];
  try {
    forumHits = (await listPosts({ q: text, limit: 3 })).posts;
  } catch {}
  if (token !== sToken) return;
  const groups = [
    { name: 'Forum', items: forumHits.map((p) => ({ kind: 'forum', id: p.id, title: p.title, meta: `${categoryLabel[p.category] || p.category} · ${p.replyCount} ${p.replyCount === 1 ? 'reply' : 'replies'}` })) },
    { name: 'FAQ', items: faqFuse.search(text, { limit: 3 }).map((r) => ({ kind: 'faq', id: r.item.id, title: r.item.q, meta: 'Mga Karaniwang Tanong' })) },
    { name: 'Schools', items: schoolFuse.search(text, { limit: 3 }).map((r) => ({ kind: 'school', id: r.item.id, name: r.item.name, title: r.item.name, meta: `${r.item.type} · ${r.item.city}, ${r.item.province}` })) },
  ].filter((g) => g.items.length);

  sBox.replaceChildren();
  sOptions = [];
  if (!groups.length) {
    sBox.append(el('p', { class: 'cm-res__none', text: 'Walang nahanap. Subukan ang ibang salita, o magtanong sa forum!' }));
  }
  groups.forEach((group) => {
    sBox.append(el('p', { class: 'cm-res__group', role: 'presentation', text: group.name }));
    group.items.forEach((item) => {
      const node = el(
        'button',
        { class: 'cm-res__opt', type: 'button', role: 'option', id: `res-${item.kind}-${item.id}`, 'aria-selected': 'false', tabindex: '-1' },
        el('span', { class: 'cm-res__title', text: item.title }),
        el('span', { class: 'cm-res__meta', text: item.meta }),
      );
      node.addEventListener('click', () => chooseResult(item));
      node.addEventListener('mousemove', () => setActive(sOptions.findIndex((o) => o.node === node)));
      sBox.append(node);
      sOptions.push({ node, ...item });
    });
  });
  sBox.hidden = false;
  sInput.setAttribute('aria-expanded', 'true');
  sActive = -1;
  if (motion()) gsap.fromTo(sBox, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out', clearProps: 'transform,opacity,visibility' });
}

sInput.addEventListener('input', () => {
  clearTimeout(sTimer);
  sTimer = setTimeout(searchEverything, 220);
});
sInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!sBox.hidden) {
      event.preventDefault();
      closeResults();
    }
    return;
  }
  if (sBox.hidden || !sOptions.length) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    setActive((sActive + step + sOptions.length) % sOptions.length);
  }
});
sForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!sBox.hidden && sOptions.length) chooseResult(sOptions[Math.max(sActive, 0)]);
  else searchEverything();
});
document.addEventListener('click', (event) => {
  if (!sForm.contains(event.target)) closeResults();
});

/* =====================================================================
   Start
   ===================================================================== */
fillCities();
runSearch();
loadPosts();

function openFromHash() {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash === 'forum' || hash === 'testimonials') {
    selectTab(hash, { animate: false });
    hub.scrollIntoView({ block: 'start' });
  } else if (hash.startsWith('faq-')) {
    openFaq(hash.slice(4), false);
  }
}
openFromHash();
window.addEventListener('hashchange', openFromHash);
