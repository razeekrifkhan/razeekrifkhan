# Victoria Foreign Employment website

The original profile `README.md` is preserved. The website project lives in this repository and builds to `dist/`.

## Run locally

Node 24.19.0 was used. Astro requires Node >=22.12.0. In the cloud workspace:

```sh
cd /workspace/razeekrifkhan
npm ci --cache /workspace/.npm-cache
ASTRO_TELEMETRY_DISABLED=1 npm run dev -- --port 4321
```

`ASTRO_TELEMETRY_DISABLED=1` avoids writing telemetry configuration outside the writable workspace. This Astro version starts its development server in the background; use `ASTRO_TELEMETRY_DISABLED=1 npx astro dev status` or `astro dev stop` as needed. Future tasks should use the existing checkout: the cloud task is already isolated, so do not create a Git worktree unless requested.

## Validate

```sh
ASTRO_TELEMETRY_DISABLED=1 npm run check
ASTRO_TELEMETRY_DISABLED=1 npm run build
npm test
```

Tests use system Chromium at `/usr/bin/chromium`; set `CHROMIUM_PATH` to another installed Chromium executable if needed. `npm test` exercises the built files, so rebuild after edits. The test runner starts the static verification server on port 4322 unless one is already available. To inspect the built files manually, run `npm run serve:build`.

## Structure

- `src/pages/`: homepage, service index, four service details, employer guide, about, enquiry, privacy, and 404.
- `src/data.ts`: supported roles, service content, company contact details, and FAQs.
- `src/layouts/Layout.astro`: shared navigation, footer, local fonts, metadata.
- `src/scripts/enquiry.ts`: validation, review, email/WhatsApp draft generation, copy/download.
- `src/styles/global.css`: visual system and responsive layouts.
- `public/`: optimised imagery, favicon, checklist, and compatible static-host security headers.
- `tests/`: production-output browser and accessibility checks.
- `docs/`: research, company review, test evidence, screenshots, and handover.

## Deployment

No hosting project or approved public domain was available in this session. The Sites connector had no callable tools. No website deployment or public website URL was created. The source is now published on GitHub branch `codex/victoria-website`; see ACCESS.md for download instructions.

Build for an **approved** origin by supplying environment variables in your host or shell:

```sh
PUBLIC_SITE_URL=https://YOUR-APPROVED-DOMAIN PUBLIC_INDEXABLE=true ASTRO_TELEMETRY_DISABLED=1 npm run build
```

Use `npm ci` as installation, `npm run build` as build command, and `dist` as the publish directory on a static HTTPS host. The site expects deployment at the domain root, not under a repository-name subpath. For GitHub Pages project hosting, configure an approved custom domain or adapt all root-relative paths first.

The default build is intentionally non-indexable for stakeholder review. `PUBLIC_SITE_URL` activates absolute canonical / social-image URLs and sitemap entries. `PUBLIC_INDEXABLE=true` enables indexing in metadata and robots.txt; set it only after company approval. `.env.example` documents the fields; export them in the shell or set them in the hosting environment before the build.

The host must serve clean directory URLs and use `404.html` with a real HTTP 404 status for unknown paths. `_headers` supplies basic security and immutable hashed-asset caching on supporting hosts such as Netlify or Cloudflare Pages. On other hosts, configure equivalent headers, compression, and cache rules yourself. Validate HTTPS, redirects, 404 handling, headers, links, and enquiry handoffs after deployment. The local Node server is a verification utility, not the production hosting service.

No backend credentials are required for the implemented brief builder. Opening WhatsApp or an email draft does not confirm delivery; the visitor must send the message in that app. Clipboard and text-download fallbacks are included. Actual inbox delivery remains untested.

See [handover](docs/HANDOVER.md), [research](docs/RESEARCH.md), and [company review requirements](docs/CONTENT-REVIEW.md).
