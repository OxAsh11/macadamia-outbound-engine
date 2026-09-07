#!/usr/bin/env python3
"""Create GitHub repo + push the Macadamia app. Uses GITHUB_TOKEN from hermes .env."""
import json, subprocess, os, sys

ENV = r"C:/Users/Ashish Mishra/AppData/Local/hermes/.env"
token = [l.split("=", 1)[1].strip() for l in open(ENV, encoding="utf-8", errors="ignore") if l.startswith("GITHUB_TOKEN=")][0]
APP = r"C:/Users/Ashish Mishra/macadamia-app"

# 1) create private repo
import urllib.request
req = urllib.request.Request(
    "https://api.github.com/user/repos",
    data=json.dumps({
        "name": "macadamia-outbound-engine",
        "private": True,
        "description": "EPC account-discovery engine + CRM — Macadamia Founding GTM Lead work sample",
    }).encode(),
    headers={"Authorization": f"token {token}", "Accept": "application/vnd.github+json", "User-Agent": "outbound-engine"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        repo = json.load(r)
        print("repo:", repo["full_name"], "| private:", repo["private"], "| default_branch:", repo["default_branch"])
except urllib.error.HTTPError as e:
    body = e.read().decode()
    if e.code == 422:
        print("repo exists already — continuing to push")
        repo = {"full_name": "OxAsh11/macadamia-outbound-engine", "default_branch": "main"}
    else:
        print("CREATE FAILED", e.code, body[:300]); sys.exit(1)

# 2) push
remote = f"https://OxAsh11:{token}@github.com/OxAsh11/macadamia-outbound-engine.git"
def git(*args):
    r = subprocess.run(["git", "-C", APP] + list(args), capture_output=True, text=True, timeout=120)
    return (r.returncode, r.stdout.strip() + r.stderr.strip())

print(git("branch", "-M", "main"))
print(git("remote", "remove", "origin") if git("remote")[1].find("origin") >= 0 else "no origin yet")
print(git("remote", "add", "origin", remote))
rc, out = git("push", "-u", "origin", "main")
print("push:", rc, out[:400])
