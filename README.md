# Sarnia Digital

Studio site for [sarnia.digital](https://sarnia.digital). Based in Guernsey.

The brand is Sarnia Digital. The domain, and the wordmark band, stay Sarnia.Digital.

## Publishing

The live site is GitHub Pages on the `gh-pages` branch, served at **https://sarnia.digital** (the
domain is at OVH; its DNS points at GitHub Pages).

- Build for the **domain root**: base path `/`, not `/sarnia-digital/`. Every asset and link must
  start at `/`, because the site no longer lives under a subpath.
- `public/CNAME` holds `sarnia.digital` and must end up at the root of what's published. Without it,
  GitHub drops the custom domain on the next push to `gh-pages`.
