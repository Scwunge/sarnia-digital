"""Publish site/ to the VPS that serves sarnia.digital (vps-ae6e2889, Caddy, /srv/sarnia-digital/site).

    python tools/deploy.py          # dry run: lists what would change, touches nothing
    python tools/deploy.py --yes    # does it

It talks to the server through the `ovh-new-ts` SSH alias (Tailscale, user ubuntu, passwordless sudo), so
the only thing it needs is ssh. It compares checksums, streams the new and changed files over ssh as a tar,
stages them in /tmp, copies the live folder to /srv/sarnia-digital/site.bak-<timestamp>, then installs them
as root:root 644, index.html LAST so visitors never see a half-published page.

  - Nothing on the server is ever deleted. Files only the server has (like /guernseysaidnotogst/) stay.
  - Dotfiles (.htaccess) and *.php (send.php) are never uploaded: they were for the old OVH web hosting,
    Caddy would serve them as plain files, and Caddy sends /send.php to the Sarnia Builder service.
  - sitemap.xml: the server's copy is kept while it already has every <url> the repo's has. When the
    repo's sitemap changes, it is uploaded with the server's extra <url> entries carried over, so pages
    that only live on the server stay listed.
"""
import argparse
import hashlib
import io
import json
import os
import re
import shlex
import subprocess
import sys
import tarfile

HOST = os.environ.get("SARNIA_DEPLOY_HOST", "ovh-new-ts")
LIVE = "/srv/sarnia-digital/site"
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site"))
SITEMAP = "sitemap.xml"

# Runs on the server (as root): prints {path: sha256} for every file in the live folder, plus the sitemap.
REMOTE_MANIFEST = r"""
import hashlib, json, os, sys
root = sys.argv[1]
files = {}
for folder, _dirs, names in os.walk(root):
    for name in names:
        full = os.path.join(folder, name)
        with open(full, "rb") as f:
            files[os.path.relpath(full, root)] = hashlib.sha256(f.read()).hexdigest()
sitemap = os.path.join(root, "sitemap.xml")
text = open(sitemap, encoding="utf-8").read() if os.path.isfile(sitemap) else None
print(json.dumps({"files": files, "sitemap": text}))
"""

# Runs on the server: tar on stdin -> staging folder -> backup -> install, index.html last.
REMOTE_INSTALL = r"""
set -eu
live=%(live)s
stage=$(mktemp -d /tmp/sarnia-deploy.XXXXXX)
trap 'rm -rf "$stage"' EXIT
tar -xf - -C "$stage"
backup="$live.bak-$(date +%%Y%%m%%d-%%H%%M%%S)"
sudo cp -a "$live" "$backup"
echo "backup: $backup"
cd "$stage"
find . -type f ! -path ./index.html -print0 | while IFS= read -r -d '' f; do
  sudo install -D -o root -g root -m 644 "$f" "$live/${f#./}"
done
if [ -f index.html ]; then sudo install -o root -g root -m 644 index.html "$live/index.html"; fi
"""


def skipped(rel):
    name = rel.rsplit("/", 1)[-1]
    return name.startswith(".") or name.endswith(".php")


def local_files():
    """{rel: bytes} for everything under site/ that belongs on the VPS."""
    out = {}
    for folder, dirs, names in os.walk(ROOT):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for name in names:
            full = os.path.join(folder, name)
            rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
            if not skipped(rel):
                with open(full, "rb") as f:
                    out[rel] = f.read()
    return out


def ssh(command, data=None):
    proc = subprocess.run(["ssh", "-o", "BatchMode=yes", HOST, command], input=data, capture_output=True)
    if proc.returncode != 0:
        sys.exit(f"ssh {HOST} failed ({proc.returncode}):\n{proc.stderr.decode(errors='replace')}")
    return proc.stdout


def remote_state():
    cmd = "sudo python3 -c " + shlex.quote(REMOTE_MANIFEST) + " " + shlex.quote(LIVE)
    state = json.loads(ssh(cmd))
    state["files"] = {k.replace(os.sep, "/"): v for k, v in state["files"].items()}
    return state


def url_entries(xml):
    return re.findall(r"<url>.*?</url>", xml or "", re.S)


def plan_sitemap(local_xml, server_xml):
    """The sitemap bytes to upload, or None to keep the server's copy."""
    ours, theirs = url_entries(local_xml), url_entries(server_xml)
    if server_xml is not None and all(u in theirs for u in ours):
        return None
    extra = [u for u in theirs if u not in ours]
    if not extra:
        return local_xml.encode("utf-8")
    merged = local_xml.replace("</urlset>", "".join(f"  {u}\n" for u in extra) + "</urlset>", 1)
    return merged.encode("utf-8")


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description="Publish site/ to the sarnia.digital VPS.")
    parser.add_argument("--yes", action="store_true", help="apply the changes (without it, only a dry run)")
    args = parser.parse_args()

    files = local_files()
    state = remote_state()
    server = state["files"]

    sitemap_note = None
    if SITEMAP in files:
        local_xml = files[SITEMAP].decode("utf-8")
        upload = plan_sitemap(local_xml, state["sitemap"])
        if upload is None:
            del files[SITEMAP]
        else:
            files[SITEMAP] = upload
            if upload != local_xml.encode("utf-8"):
                sitemap_note = "repo's sitemap plus the server's own <url> entries"

    new = sorted(r for r in files if r not in server)
    changed = sorted(r for r in files if r in server and sha(files[r]) != server[r])
    server_only = sorted(r for r in server if r not in files and r != SITEMAP)

    print(f"{HOST}:{LIVE}")
    for rel in new:
        print(f"  + {rel}")
    for rel in changed:
        print(f"  ~ {rel}" + (f"  ({sitemap_note})" if rel == SITEMAP and sitemap_note else ""))
    if server_only:
        print(f"  left alone (only on the server): {', '.join(server_only)}")
    todo = new + changed
    if not todo:
        print("No changes: the server already matches site/.")
        return
    print(f"{len(new)} new, {len(changed)} changed.")
    if not args.yes:
        print("Dry run. Run again with --yes to publish.")
        return

    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w", format=tarfile.PAX_FORMAT) as tar:
        for rel in todo:
            info = tarfile.TarInfo(rel)
            info.size = len(files[rel])
            info.mode = 0o644
            tar.addfile(info, io.BytesIO(files[rel]))
    script = REMOTE_INSTALL % {"live": shlex.quote(LIVE)}
    print(ssh("bash -c " + shlex.quote(script), buf.getvalue()).decode().strip())

    after = remote_state()["files"]
    wrong = [r for r in todo if after.get(r) != sha(files[r])]
    if wrong:
        sys.exit(f"Installed, but these don't match on the server: {', '.join(wrong)}")
    print(f"Done: {len(todo)} files published to https://sarnia.digital/ "
          "(CSS/JS are cached for a year, so bump their ?v= in the HTML when they change).")


if __name__ == "__main__":
    main()
