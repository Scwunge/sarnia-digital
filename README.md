# Sarnia Digital

Studio site for [sarnia.digital](https://sarnia.digital). Based in Guernsey.

The brand is Sarnia Digital. The domain, and the wordmark band, stay Sarnia.Digital.

## Publishing

The live site is on **OVH web hosting** (cluster 129), where the domain is too: https://sarnia.digital.
It's a static build, uploaded over SFTP (`ftp.cluster129.hosting.ovh.net`, port 22, the hosting's
FTP user) into `www/`.

- Build for the **domain root**: base path `/`. Every asset and link starts at `/`.
- `public/.htaccess` and `public/assets/.htaccess` go out with every build. They send `http://` and
  `www.` to https://sarnia.digital, serve `404.html` for missing pages, and cache the hashed assets
  for a year (pages are checked every visit).
- `gh-pages` holds the current build, exactly as uploaded. GitHub Pages itself is off.
