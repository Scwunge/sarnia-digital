"""Publish site/ to the OVH web hosting over SFTP.

    python tools/deploy.py

It asks for the hosting's FTP password (typed on your keyboard, never stored or logged). To skip the prompt,
set SARNIA_FTP_PASS in your own terminal first. Files are uploaded into www/, index.html LAST so visitors never
see a half-published page. Nothing on the server is deleted, and dotfiles such as .htaccess ARE uploaded.

Needs: pip install paramiko
"""
import getpass
import os
import posixpath
import sys

import paramiko

HOST = "ftp.cluster129.hosting.ovh.net"
PORT = 22
USER = os.environ.get("SARNIA_FTP_USER", "sarnian")
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")
REMOTE = "www"


def local_files():
    out = []
    for folder, _dirs, names in os.walk(ROOT):
        for name in names:
            full = os.path.join(folder, name)
            rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
            out.append((full, rel))
    # index.html last, everything else first
    out.sort(key=lambda t: (t[1] == "index.html", t[1]))
    return out


def ensure_dir(sftp, path):
    parts = path.split("/")
    cur = ""
    for part in parts:
        cur = part if not cur else cur + "/" + part
        try:
            sftp.stat(cur)
        except IOError:
            sftp.mkdir(cur)


def main():
    password = os.environ.get("SARNIA_FTP_PASS") or getpass.getpass(f"FTP password for {USER}@{HOST}: ")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, PORT, USER, password, look_for_keys=False, allow_agent=False, timeout=30)
    sftp = client.open_sftp()
    files = local_files()
    print(f"Uploading {len(files)} files to {REMOTE}/ ...")
    for full, rel in files:
        remote_path = posixpath.join(REMOTE, rel)
        ensure_dir(sftp, posixpath.dirname(remote_path))
        sftp.put(full, remote_path)
        print("  ", rel)
    sftp.close()
    client.close()
    print("Done. https://sarnia.digital/ is updated (CSS/JS are cached: the ?v= in index.html was bumped).")


if __name__ == "__main__":
    try:
        main()
    except paramiko.AuthenticationException:
        sys.exit("Login failed: check the FTP user and password in the OVH manager (Hosting plans > FTP-SSH).")
