# Backend plan: Community page

This follows the **Proposal and Tech Stack** (section 4, "Community page and forum"). The Community page
**frontend is built**. The forum runs on sample data ("mock mode") until the backend below is connected.
Switching is a setting, not a rewrite: the page only talks to `src/scripts/forum-api.js`.

## What we take from Superhuman, and where it lives

| From the Proposal | In the page | Backend piece |
|---|---|---|
| A big search bar at the top | Hero search (`CommunityHero.astro`, `community.js`). Looks through forum topics, FAQ and schools | Forum search is a query parameter on `GET /api/posts` |
| Topics grouped by category | Category chips filter one list (`categories` in `community-content.js`): Questions about AFA, Choosing a school, Student projects, Off-topic | `category` column, a filter (no separate pages) |
| A simple topic list: title, category, replies, last reply | `.cm-topic` rows | `reply_count` and `last_activity` in the list response |
| One "Ask a question" button | `Ask a question` opens a form dialog | `POST /api/posts` |
| Nickname only | Nickname field, "don't use your real name" hint | `nickname` column. No accounts |
| Approve each post first | After sending, the visitor sees "waiting for review" | `approved = false` on insert; moderator ticks it |
| No email collected (users are minors) | The form has no email field | No email column |
| Profanity filter and a posting speed limit | The form explains both kindly | Done on the server (see below) |
| Short privacy note (RA 10173) | Link under every form to `/privacy` | The Privacy page (to be written) |

**Left out on purpose** (as in the Proposal): sign-up and login, votes, badges, user profiles, and a page per category.

Everything else on the Community page needs **no backend**: Testimonials and the FAQ are text we write
(`community-content.js`), and the school locator is one list file, `src/data/schools.json`, searched in the browser with Fuse.js.

## Data (Supabase)

```sql
create table posts (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('afa','school','projects','offtopic')),
  title       text not null check (char_length(title) between 5 and 120),
  body        text not null check (char_length(body) between 10 and 1000),
  nickname    text not null check (char_length(nickname) between 2 and 24),
  approved    boolean not null default false,
  ip_hash     text,                          -- hashed, only for the speed limit
  created_at  timestamptz not null default now()
);

create table replies (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references posts(id) on delete cascade,
  body        text not null check (char_length(body) between 10 and 600),
  nickname    text not null check (char_length(nickname) between 2 and 24),
  approved    boolean not null default false,
  ip_hash     text,
  created_at  timestamptz not null default now()
);

create index on posts (approved, created_at desc);
create index on replies (post_id, approved, created_at);

-- Lock both tables completely. No policy for the public "anon" key, so the browser can never read or write
-- them directly. Only the server function (with the service key) can.
alter table posts   enable row level security;
alter table replies enable row level security;
```

Why no browser access at all: the browser would otherwise hold a key that could post without the language
filter or the speed limit. With the lock, every read and write goes through our own API, which is where those rules live.

**Moderating:** Supabase dashboard, Table editor, `posts` or `replies`, tick `approved`. No admin page needed.

## API (what `forum-api.js` calls)

All bodies are JSON. The browser never sees the database.

| Call | Success | Errors |
|---|---|---|
| `GET /api/posts?category=&q=&limit=&offset=` | `200 { posts: [{ id, title, category, nickname, body, createdAt, replyCount, lastActivity }], total }` (approved only) | `500` |
| `GET /api/posts/:id` | `200 { post, replies: [{ id, nickname, body, createdAt }] }` (approved only) | `404`, `500` |
| `POST /api/posts` with `{ nickname, category, title, body, website, turnstileToken }` | `201 { status: "pending" }` | `400 { field, message }` invalid, `422 { message }` language filter, `429 { message, retryAfter }` too fast |
| `POST /api/posts/:id/replies` with `{ nickname, body, website, turnstileToken }` | `201 { status: "pending" }` | same as above |

`website` is the hidden honeypot field: if it has anything in it, answer `201` and save nothing.
Messages in the errors are shown to the visitor as they are (write them in Taglish, kindly).

## Where it runs: Cloudflare Pages Functions

Files in a `functions/` folder next to `src/` (Cloudflare turns them into the `/api/...` routes):

```
functions/
  api/posts/index.js              GET list, POST new post
  api/posts/[id]/index.js         GET one topic with its replies
  api/posts/[id]/replies.js       POST new reply
  _lib/validate.js                same rules as validatePost() in forum-api.js
  _lib/filter.js                  language filter (English and Tagalog word list we maintain)
  _lib/limits.js                  speed limit
  _lib/turnstile.js               checks the Cloudflare Turnstile token
  _lib/db.js                      small wrapper over Supabase's REST API (service key)
```

Settings (Cloudflare Pages, Settings, Environment variables). Secrets are never in the code or the browser:

| Name | Where | What |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | secret | the project URL and the service key |
| `TURNSTILE_SECRET` | secret | Cloudflare Turnstile (free) |
| `IP_SALT` | secret | a long random text, used to hash IP addresses |
| `PUBLIC_FORUM_MODE` | plain | set to `live` to switch the page off the sample data |
| `PUBLIC_FORUM_API` | plain | only if the API is not at `/api` |

## What the server checks on every post or reply (the Proposal's promises)

1. Same length and character rules as the form, repeated (never trust the browser).
2. Honeypot filled: pretend it worked, save nothing.
3. Turnstile token verified (the box goes where the comment is in `CommunityHub.astro`).
4. Language filter on title, body and nickname. A match returns `422`.
5. **Speed limit** per visitor (hash of IP and browser): for example 1 post per 60 seconds and 5 per hour. A simple count of recent rows with the same `ip_hash`. Over the limit returns `429` with `retryAfter`.
6. Saved with `approved = false`. Nothing shows until a moderator approves it.
7. Output is plain text. The page puts every visitor's text on screen with `textContent`, never as HTML.

## Privacy (Data Privacy Act, RA 10173) and minors

- We store a nickname, the text, the time, and a salted hash of the IP address, only for the speed limit. **No email, no real names, no accounts.**
- Delete the hash after 30 days: `update posts set ip_hash = null where created_at < now() - interval '30 days';` (same for `replies`), run weekly.
- The Privacy page (`/privacy`) must say: what is stored, why, how long, that visitors may ask for a post to be removed (use the contact email), and that the forum is for ages 15 to 18 with review before posting.
- Tell visitors not to post names, addresses or phone numbers (the form already says so).

## Go-live checklist

- [ ] Create the Supabase project (pick the Singapore region), run the SQL above.
- [ ] Create the Turnstile site (Cloudflare dashboard) and add its widget to the dialog and the reply form.
- [ ] Write the `functions/` files, with tests for each rule above.
- [ ] Set the environment variables in Cloudflare Pages, then deploy (needs the GitHub repository).
- [ ] Set `PUBLIC_FORUM_MODE=live` and test posting, replying, approving, the speed limit and the language filter on the live site.
- [ ] Write the Privacy page. Replace the sample content (see ASSETS.md) and set `showSampleTags: false` in `community.config.js`.
- [ ] Supabase's free tier can pause a project after about a week of no use. Open it a few days before the defense (and make a habit of checking), or add a small weekly ping.

## Fallback (from the Proposal)

If time runs out: no database. Visitors send a question through the Contact form (Formspree or Web3Forms), the team answers it and adds it to the FAQ in `community-content.js`.
To do this, hide the forum tab (remove the `forum` card and panel in `CommunityHub.astro`) and point "Ask a question" to the Contact page.

## Status

| Piece | Status |
|---|---|
| Community page frontend (search, tabs, forum list, threads, ask form, replies, FAQ, school locator) | Built |
| `forum-api.js` with mock mode (sample topics, rate limit and language filter simulated) | Built |
| API contract (this file) | Written |
| Supabase project, SQL, `functions/` folder, Turnstile, deployment | Not started |
| Privacy page | Not started |
| Real testimonials, real school list, real forum moderation | Waiting for content |
