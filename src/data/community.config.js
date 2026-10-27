// Community page settings.
//
// mode "mock": the forum runs on the sample topics in community-content.js. Nothing is saved anywhere,
//              so the whole page can be built and shown before the backend exists.
// mode "live": the forum talks to the API described in BACKEND.md (Cloudflare Pages Functions in front of
//              Supabase). Switch by setting PUBLIC_FORUM_MODE=live (and PUBLIC_FORUM_API if the API is not
//              at /api) in the Cloudflare Pages environment variables. No code change needed.
export const communityConfig = {
  mode: import.meta.env.PUBLIC_FORUM_MODE === 'live' ? 'live' : 'mock',
  apiBase: import.meta.env.PUBLIC_FORUM_API || '/api',

  // Tags sample content (topics, testimonials, schools) as "Sample" until the real content arrives.
  // Set to false when the real content is in.
  showSampleTags: true,

  // Limits are enforced again on the server. They are repeated here so the form can say so politely.
  limits: { nickname: 24, title: 120, body: 1000, reply: 600 },
  // Minimum seconds between posts from one visitor (the server rate limit is the real protection).
  postCooldownSeconds: 60,
};
