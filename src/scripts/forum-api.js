// The forum's data layer. The page only ever talks to these four functions, so switching from the sample
// data to the real backend is a setting (community.config.js), not a rewrite.
//
//   listPosts({ category, q, limit, offset })  -> { posts, total }
//   getThread(id)                              -> { post, replies }
//   createPost({ nickname, category, title, body, website })
//   createReply(id, { nickname, body, website })
//
// "website" is a honeypot: it is hidden from people, so only bots fill it in.
// Errors are ForumError with a code the form can explain kindly:
//   invalid | rejected (language filter) | rate_limited | network | server
// The real API (Cloudflare Pages Functions + Supabase) is described in BACKEND.md.
import Fuse from 'fuse.js';
import { communityConfig as cfg } from '../data/community.config.js';
import { categories, samplePosts } from '../data/community-content.js';

export class ForumError extends Error {
  constructor(code, message, extra = {}) {
    super(message);
    this.name = 'ForumError';
    this.code = code;
    Object.assign(this, extra);
  }
}

const DAY = 86400000;
const iso = (daysAgo) => new Date(Date.now() - daysAgo * DAY).toISOString();
const categoryIds = categories.map((c) => c.id);

/* ---------- Checks shared by both modes (the server repeats them) ---------- */
export function validatePost({ nickname, category, title, body }, kind = 'post') {
  const lim = cfg.limits;
  // checked in the order the fields appear on the form, so the first problem shown is the first one to fix
  if (kind === 'post') {
    if (!categoryIds.includes(category)) return { field: 'category', message: 'Pumili ng category.' };
    const t = (title || '').trim();
    if (t.length < 5) return { field: 'title', message: 'Medyo maikli ang title (kahit 5 letra man lang).' };
    if (t.length > lim.title) return { field: 'title', message: `Hanggang ${lim.title} letra lang ang title.` };
  }
  const text = (body || '').trim();
  const max = kind === 'post' ? lim.body : lim.reply;
  if (text.length < 10) return { field: 'body', message: 'Medyo maikli. Isulat ang tanong o sagot mo (kahit 10 letra man lang).' };
  if (text.length > max) return { field: 'body', message: `Hanggang ${max} letra lang ang mensahe.` };
  const nick = (nickname || '').trim();
  if (nick.length < 2) return { field: 'nickname', message: 'Maglagay ng nickname (2 hanggang 24 letra).' };
  if (nick.length > lim.nickname) return { field: 'nickname', message: `Hanggang ${lim.nickname} letra lang ang nickname.` };
  if (!/^[\p{L}\p{N} _.\-]+$/u.test(nick)) return { field: 'nickname', message: 'Letra, numero, space, _ . at - lang ang pwede sa nickname.' };
  return null;
}

/* ---------- Mock mode: the sample topics, kept in memory ---------- */
let mockPosts = null;
function mock() {
  if (!mockPosts) {
    mockPosts = samplePosts.map((p) => {
      const replies = p.replies.map((r) => ({ id: r.id, nickname: r.nickname, body: r.body, createdAt: iso(r.daysAgo) }));
      const createdAt = iso(p.daysAgo);
      const last = replies.length ? replies[replies.length - 1].createdAt : createdAt;
      return { id: p.id, title: p.title, category: p.category, nickname: p.nickname, body: p.body, createdAt, replies, lastActivity: last, sample: true };
    });
  }
  return mockPosts;
}
const summary = (p) => ({
  id: p.id, title: p.title, category: p.category, nickname: p.nickname, body: p.body,
  createdAt: p.createdAt, replyCount: p.replies.length, lastActivity: p.lastActivity, sample: !!p.sample,
});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A small stand-in for the server's language filter, only so the form's "rejected" message can be seen
// in mock mode. The real filter (English and Tagalog) lives on the server.
const mockBlocked = ['bobo', 'tanga', 'gago', 'stupid', 'idiot'];
const mockRejects = (text) => mockBlocked.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(text));

function cooldown(key) {
  try {
    const last = +localStorage.getItem(key) || 0;
    const left = Math.ceil((last + cfg.postCooldownSeconds * 1000 - Date.now()) / 1000);
    if (left > 0) throw new ForumError('rate_limited', `Sandali lang! Subukan ulit pagkalipas ng ${left} segundo.`, { retryAfter: left });
  } catch (e) {
    if (e instanceof ForumError) throw e;
  }
}
const markSent = (key) => {
  try { localStorage.setItem(key, String(Date.now())); } catch {}
};

/* ---------- Live mode: the real API ---------- */
async function live(path, options) {
  let res;
  try {
    res = await fetch(`${cfg.apiBase}${path}`, { headers: { 'content-type': 'application/json' }, ...options });
  } catch {
    throw new ForumError('network', 'Hindi makakonekta ngayon. Subukan ulit mamaya.');
  }
  if (res.ok) return res.status === 204 ? null : res.json();
  const data = await res.json().catch(() => ({}));
  if (res.status === 429) throw new ForumError('rate_limited', data.message || 'Sandali lang! Subukan ulit mamaya.', { retryAfter: data.retryAfter });
  if (res.status === 422) throw new ForumError('rejected', data.message || 'Pakiayos ang mga salita at subukan ulit.');
  if (res.status === 400) throw new ForumError('invalid', data.message || 'Hindi tama ang ilang detalye.', { field: data.field });
  throw new ForumError('server', 'May problema sa server. Subukan ulit mamaya.');
}

/* ---------- The four calls the page uses ---------- */
export async function listPosts({ category = 'all', q = '', limit = 6, offset = 0 } = {}) {
  if (cfg.mode === 'live') {
    const params = new URLSearchParams({ limit, offset });
    if (category !== 'all') params.set('category', category);
    if (q.trim()) params.set('q', q.trim());
    return live(`/posts?${params}`);
  }
  await wait(250);
  let list = mock();
  if (category !== 'all') list = list.filter((p) => p.category === category);
  if (q.trim()) {
    const fuse = new Fuse(list, { keys: ['title', 'body', 'nickname'], threshold: 0.35, ignoreLocation: true });
    list = fuse.search(q.trim()).map((r) => r.item);
  } else {
    list = [...list].sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  }
  return { posts: list.slice(offset, offset + limit).map(summary), total: list.length };
}

export async function getThread(id) {
  if (cfg.mode === 'live') return live(`/posts/${encodeURIComponent(id)}`);
  await wait(200);
  const post = mock().find((p) => p.id === id);
  if (!post) throw new ForumError('server', 'Hindi na mahanap ang topic na ito.');
  return { post: summary(post), replies: post.replies };
}

export async function createPost(data) {
  if (data.website) return { status: 'pending' }; // honeypot filled: act as if it worked, save nothing
  const problem = validatePost(data, 'post');
  if (problem) throw new ForumError('invalid', problem.message, { field: problem.field });
  if (cfg.mode === 'live') return live('/posts', { method: 'POST', body: JSON.stringify(data) });
  cooldown('aninatin.lastPost');
  await wait(800);
  if (mockRejects(`${data.title} ${data.body} ${data.nickname}`)) {
    throw new ForumError('rejected', 'May mga salita na hindi pwede sa forum. Pakiayos at subukan ulit.');
  }
  markSent('aninatin.lastPost');
  return { status: 'pending', id: `pending-${Date.now()}` };
}

export async function createReply(id, data) {
  if (data.website) return { status: 'pending' };
  const problem = validatePost(data, 'reply');
  if (problem) throw new ForumError('invalid', problem.message, { field: problem.field });
  if (cfg.mode === 'live') return live(`/posts/${encodeURIComponent(id)}/replies`, { method: 'POST', body: JSON.stringify(data) });
  cooldown('aninatin.lastPost');
  await wait(700);
  if (mockRejects(`${data.body} ${data.nickname}`)) {
    throw new ForumError('rejected', 'May mga salita na hindi pwede sa forum. Pakiayos at subukan ulit.');
  }
  markSent('aninatin.lastPost');
  return { status: 'pending' };
}
