import { defineConfig } from 'astro/config';

// Static site. Cloudflare Pages build settings:
//   Build command: npm run build
//   Output directory: dist
export default defineConfig({
  // The whole site's CSS is small, so it is put inside each page: no render-blocking stylesheet request,
  // which helps the first paint on slow phones.
  build: { inlineStylesheets: 'always' },
});
