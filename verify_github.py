#!/usr/bin/env python3
"""Verify GitHub push from API."""
import json, urllib.request

ENV = r"C:/Users/Ashish Mishra/AppData/Local/hermes/.env"
token = [l.split("=", 1)[1].strip() for l in open(ENV, encoding="utf-8", errors="ignore") if l.startswith("GITHUB_TOKEN=")][0]

req = urllib.request.Request(
    "https://api.github.com/repos/OxAsh11/macadamia-outbound-engine/commits?per_page=5",
    headers={"Authorization": f"token {token}", "User-Agent": "verify"},
)
with urllib.request.urlopen(req, timeout=30) as r:
    commits = json.load(r)
for c in commits:
    print(c["sha"][:7], "|", c["commit"]["message"][:60], "|", c["commit"]["author"]["name"])

req2 = urllib.request.Request(
    "https://api.github.com/repos/OxAsh11/macadamia-outbound-engine",
    headers={"Authorization": f"token {token}", "User-Agent": "verify"},
)
with urllib.request.urlopen(req2, timeout=30) as r:
    repo = json.load(r)
print("repo:", repo["full_name"], "| private:", repo["private"], "| size(KB):", repo["size"])
