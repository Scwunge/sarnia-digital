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
  send.php            emails a brief from the contact form to hello@sarnia.digital
  .htaccess           https + bare-domain redirects, 404, security headers (CSP), caching
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
```

No build step, no framework. It's plain HTML, CSS and a little JavaScript, and the page works
without JavaScript. The first version (a TanStack app from Grok) is in the git history.

## Hosting

- **Where:** OVH web hosting (cluster 129), where the domain and email live too.
- **How to publish:** run `python tools/deploy.py` (asks for the FTP password; needs `pip install paramiko`), or upload the contents of `site/` into `www/` over **SFTP** by hand:
  `ftp.cluster129.hosting.ovh.net`, port 22, the hosting's FTP user. OVH's FTP has no TLS, so
  use SFTP.
- **Email:** `send.php` uses the hosting's PHP (8.2, set in `.ovhconfig`) and `mail()`, from
  `hello@sarnia.digital` with `Reply-To` set to the visitor. Its rate limit lives in
  `~/.sarnia-briefs/`, outside the web root.
- **Caching:** after changing CSS or JS, bump the `?v=` on its `<link>` or `<script>` in the HTML.
  Those files are cached for a year.
