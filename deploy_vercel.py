#!/usr/bin/env python3
"""Deploy macadamia-app to Vercel using the API token (no CLI login needed).
Steps: verify token -> create project -> upload files -> build & deploy -> URL.
Uses Vercel API v13 deployments endpoint with file injection.
"""
import json, os, base64, hashlib, urllib.request, sys

ENV = r"C:/Users/Ashish Mishra/AppData/Local/hermes/.env"
token = [l.split("=", 1)[1].strip() for l in open(ENV, encoding="utf-8", errors="ignore") if l.startswith("VERCEL_TOKEN=")][0]
APP = r"C:/Users/Ashish Mishra/macadamia-app"
TEAM = None  # personal account

def api(method, path, data=None, content_type="application/json"):
    req = urllib.request.Request(
        f"https://api.vercel.com{path}",
        data=json.dumps(data).encode() if data is not None else None,
        headers={"Authorization": f"Bearer {token}", "Content-Type": content_type},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.load(e)
        except Exception:
            return e.code, {"raw": e.read().decode()[:400]}

# 0) whoami
st, user = api("GET", "/v2/user")
if st != 200:
    print("TOKEN INVALID:", st, user); sys.exit(1)
print("vercel user:", user.get("user", {}).get("username") or user.get("user", {}).get("email"))
TEAM = user.get("user", {}).get("username")

# 1) create project (or reuse)
st, proj = api("POST", "/v9/projects", {"name": "macadamia-outbound-engine", "framework": "nextjs"})
if st in (200, 201):
    print("project created:", proj["name"], proj["id"])
elif st == 409 or "exist" in json.dumps(proj).lower():
    st2, projects = api("GET", "/v9/projects")
    proj = next(p for p in projects.get("projects", []) if p["name"] == "macadamia-outbound-engine")
    print("project exists:", proj["name"], proj["id"])
else:
    print("PROJECT ERROR:", st, json.dumps(proj)[:300]); sys.exit(1)

# 2) collect files (skip node_modules/.next/.git)
files = {}
SKIP_DIRS = {"node_modules", ".next", ".git", ".vercel"}
for root, dirs, fnames in os.walk(APP):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for fn in fnames:
        if fn in {"push_to_github.py", "verify_github.py", "save_vercel_token.py", "deploy_vercel.py"}:
            continue
        p = os.path.join(root, fn)
        rel = os.path.relpath(p, APP).replace(os.sep, "/")
        if rel.startswith(".env"):
            continue
        data = open(p, "rb").read()
        sha = hashlib.sha256(data).hexdigest()
        files[rel] = {"sha": sha, "size": len(data)}
print("files to upload:", len(files))

# 3) create deployment
st, dep = api("POST", f"/v13/deployments?skipAutoDetectionConfirmation=1", {
    "name": "macadamia-outbound-engine",
    "project": proj["id"],
    "target": "production",
    "files": [{"file": rel, "sha": f["sha"], "size": f["size"]} for rel, f in files.items()],
})
if st not in (200, 201):
    print("DEPLOY CREATE FAILED:", st, json.dumps(dep)[:500]); sys.exit(1)
print("deployment:", dep["id"], "| state:", dep.get("readyState"))

# 4) upload file contents
for rel, f in files.items():
    data = open(os.path.join(APP, rel.replace("/", os.sep)), "rb").read()
    stU, resp = api("POST", f"/v2/files/deployments/{dep['id']}/files?path={rel}", data, content_type="application/octet-stream")
    if stU not in (200, 201):
        print("UPLOAD FAIL:", rel, stU, json.dumps(resp)[:200]); sys.exit(1)
print("all files uploaded")

# 5) poll build
import time
for i in range(40):
    time.sleep(6)
    stP, d = api("GET", f"/v13/deployments/{dep['id']}")
    state = d.get("readyState")
    if state == "READY":
        print("DEPLOY READY:", d.get("url"))
        break
    if state == "ERROR" or d.get("errorMessage"):
        print("BUILD ERROR:", json.dumps(d.get("errorMessage", d))[:400]); sys.exit(1)
    print("  building…", state)
else:
    print("timeout waiting for build"); sys.exit(1)
