# Start here: accessing the Victoria website

## What exists

This is an Astro static website with 11 HTML pages: home, expertise, four service pages, employer guide, about, enquiry, privacy, and 404. It includes responsive navigation, role filtering, FAQs, a downloadable checklist, and a browser-local enquiry builder with validation, review, WhatsApp/email draft handoff, copy, and download.

It has no server-submitted enquiry backend, CMS, or published website URL. The contact buttons prepare drafts; they do not confirm message delivery.

## Why the original download links failed

The chat linked to paths beginning `/workspace/`. Those paths belong to the remote cloud machine; they are not public HTTPS downloads and were not exported as chat attachments. There is no callable file-export or Sites tool in this session. The ZIPs were present and valid, but the handover did not provide a usable external delivery channel.

At the initial handover, all website source files were untracked and had not been committed or pushed. The GitHub repository therefore still contained only its original profile README. A normal clone could not retrieve this new website.

## Files in the cloud machine

| Resource | Path |
| --- | --- |
| Project root | `/workspace/razeekrifkhan` |
| Source, pages, styles, interactions | `src/` |
| Images, icons, checklist, font licences | `public/` |
| Compiled static website | `dist/` (generated; not tracked) |
| Downloadable compiled review build | `downloads/Victoria-website-review-build.zip` |
| Research and company review requirements | `docs/RESEARCH.md`, `docs/CONTENT-REVIEW.md` |
| Screenshots | `docs/screenshots/` |
| Test evidence | `docs/reports/` |
| Development and deployment instructions | `WEBSITE.md` |
| Original source archive | `/workspace/Victoria-website-source.zip` |
| Original static archive | `/workspace/Victoria-website-review-build.zip` |

The source is published to GitHub on branch `codex/victoria-website`. Open https://github.com/razeekrifkhan/razeekrifkhan/tree/codex/victoria-website to browse it. The website itself is not deployed.

## Download from GitHub

1. Open the `razeekrifkhan/razeekrifkhan` repository and select the `codex/victoria-website` branch.
2. For all source and resources, use **Code → Download ZIP**, or clone that branch.
3. For the compiled review website only, open `downloads/Victoria-website-review-build.zip` and use GitHub’s raw-file download control.
4. Open this `ACCESS.md` first; the original profile `README.md` has been preserved.

GitHub publication makes the files downloadable. It does not automatically deploy a running website.

## Running a downloaded copy

For the source archive, install Node.js 24, extract it, and run from the folder containing `package.json`:

```sh
npm ci
npm run dev
```

Open the address printed by the development server on your own computer.

For the compiled review ZIP, extract it and serve the folder containing `index.html` with a local HTTP server, for example:

```sh
python -m http.server 8000
```

Then browse the local server from that computer. **Do not double-click `index.html`:** the site uses root-relative URLs and must be served over HTTP. Opening it via `file://` can break styles, images, navigation, and scripts.

For a public website, approve the domain and company information, rebuild with the launch settings in `WEBSITE.md`, and deploy to an HTTPS static host. The supplied review build deliberately prevents search indexing.

## Debugging verification — 10 October 2026

- Both original ZIPs passed CRC integrity checks and matched their corresponding workspace files before the delivery-documentation update.
- Astro/TypeScript: 0 errors, 0 warnings, 0 hints.
- Static build: 11 HTML pages successfully generated.
- Browser checks: 18 passed, 0 failed, on desktop and mobile Chromium.
- GitHub read access succeeded. The initial push was rejected with HTTP 403. After the user confirmed the app installation had read/write code access and all repositories selected, a retry succeeded. The branch is now published; the precise cause of the earlier rejection was not established.

The verified failure was the delivery method. These checks do not prove that every possible deployment or browser is fault-free, but no application regression was reproduced in the test suite.
