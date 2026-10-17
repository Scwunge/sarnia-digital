# Sarnia Digital

The studio site for **[sarnia.digital](https://sarnia.digital)**, a web studio on Guernsey.
**Small island. Big signal.**

## The idea

Sarnia is Guernsey's old Latin name, and St Peter Port is a harbour. So the whole identity is built
on the **International Code of Signals**, the maritime flags ships still use.

- The logo is S‑A‑R‑N‑I‑A as a hoist of signal flags.
- Each section is headed by a real flag and its real meaning:
  - P, "about to put to sea", for new websites;
  - U, "you are running into danger", for redesigns;
  - G, "I require a pilot", for products;
  - Q, "my vessel is healthy", for hosting;
  - K, "I wish to communicate with you", for contact;
  - O, "man overboard", on the 404 page.
- Visitors can spell their business name in flags in the contact form.

The flags are accurate. `tools/flags.mjs` draws all 26 and notes the ones that are easy to get wrong.

## What's here

```
site/                 the website, exactly as it's uploaded
  index.html          the one page
  404.html            "man overboard"
  send.php            old OVH hosting only: emailed a brief from the contact form (not deployed)
  .htaccess           old OVH hosting only: redirects, 404, headers, caching (not deployed)
  css/site.css        all the styles
  js/boot.js          marks the page as scripted before it paints
  js/site.js          flag tooltips, the Guernsey clock, the name-in-flags preview, reveals, the form
  js/flag-meanings.js generated: each flag's name and ICS meaning
  img/flags.svg       generated: the 26 letter flags as an SVG sprite (<use href="/img/flags.svg#flag-S">)
  img/og.jpg          generated: the 1200x630 share card
  img/work/*.jpg      screenshots of EnderPhone and EnderBio
  fonts/              Archivo (variable width and weight) and IBM Plex Mono, self-hosted
tools/
  flags.mjs           node tools/flags.mjs: rebuilds img/flags.svg and js/flag-meanings.js
  og.html             the share card's design
  render-images.cjs   renders og.jpg and apple-touch-icon.png (needs Playwright)
  deploy.py           python tools/deploy.py [--yes]: publishes site/ to the VPS
```

No build step, no framework. It's plain HTML, CSS and a little JavaScript, and the page works
without JavaScript. The first version (a TanStack app from Grok) is in the git history.

## Hosting

- **Where:** the OVH VPS `vps-ae6e2889` (57.129.172.31; on the tailnet as the `ovh-new-ts` SSH
  alias, user `ubuntu`, passwordless sudo). Caddy serves `/srv/sarnia-digital/site` (root:root,
  644) and sets the https redirects, headers (CSP), caching and the 404 page in
  `/etc/caddy/sites/sarnia-studio.caddy`. The domain and email are still at OVH; the old web
  hosting (cluster 129) is no longer what visitors see.
- **How to publish:** `python tools/deploy.py` prints what would change (a dry run), then
  `python tools/deploy.py --yes` publishes it. Only needs `ssh` and Python, no rsync. It streams
  the new and changed files over ssh as a tar, stages them in `/tmp`, copies the live folder to
  `/srv/sarnia-digital/site.bak-<timestamp>`, and installs them as root:root 644 with
  `index.html` last. It never deletes anything on the server, never uploads dotfiles or `*.php`,
  and keeps the server's `sitemap.xml` (which also lists pages that only live on the server,
  like `/guernseysaidnotogst/`) unless the repo's gains or changes an entry, in which case the
  server's extra entries are carried over. Old backups are left for you to clear out by hand.
- **Contact form:** Caddy sends `/send.php` to the Sarnia Builder service
  (`/api/v1/public/studio-contact` on port 3300), so the `send.php` in this repo isn't used.
- **Traffic:** every page loads `js/t.js`, which counts the visit on our traffic dashboard
  (enderphone-api, `/app/traffic`, tailnet-only). No cookies and no address kept, so no consent
  banner. A new page needs `<script src="/js/t.js?v=1" defer></script>` before `</head>`; the
  CSP's `connect-src` in the Caddy file has to allow `https://api.enderphone.cloud` for it (on
  2026-10-17 it was still `'self'` only, so the beacon was blocked).
- **Caching:** after changing CSS or JS, bump the `?v=` on its `<link>` or `<script>` in the HTML.
  Those files are cached for a year.
