#!/usr/bin/env python3
"""Deploy macadamia-app to Vercel (correct order: upload files to cache -> create deployment)."""
import json, os, hashlib, urllib.request, sys, time

ENV = r"C:/Users/Ashish Mishra/AppData/Local/hermes/.env"
token = [l.split("=", 1)[1].strip() for l in open(ENV, encoding="utf-8", errors="ignore") if l.startswith("VERCEL_TOKEN=")][0]
APP = r"C:/Users/Ashish Mishra/macadamia-app"

def api(method, path, data=None, content_type="application/json", raw=False):
    body = data if raw else (json.dumps(data).encode() if data is not None else None)
    req = urllib.request.Request(
        f"https://api.vercel.com{path}", data=body,
        headers={"Authorization": f"Bearer {token}", "Content-Type": content_type},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.load(e)
        except Exception:
            return e.code, {"raw": e.read().decode()[:400]}

st, user = api("GET", "/v2/user")
if st != 200:
    print("TOKEN INVALID:", st); sys.exit(1)
print("vercel user:", user.get("user", {}).get("username"))

# project
st, proj = api("POST", "/v9/projects", {"name": "macadamia-outbound-engine", "framework": "nextjs"})
if st not in (200, 201):
    st2, projects = api("GET", "/v9/projects")
    proj = next((p for p in projects.get("projects", []) if p["name"] == "macadamia-outbound-engine"), None)
    if not proj:
        print("PROJECT FAIL", st, json.dumps(proj)[:200]); sys.exit(1)
print("project:", proj["name"], proj["id"])

# collect files
files = {}
SKIP_DIRS = {"node_modules", ".next", ".git", ".vercel"}
SKIP_FILES = {"push_to_github.py", "verify_github.py", "save_vercel_token.py", "deploy_vercel.py", "deploy_vercel2.py"}
for root, dirs, fnames in os.walk(APP):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for fn in fnames:
        rel = os.path.relpath(os.path.join(root, fn), APP).replace(os.sep, "/")
        if fn in SKIP_FILES or rel.startswith(".env"):
            continue
        data = open(os.path.join(root, fn), "rb").read()
        files[rel] = {"sha": hashlib.sha256(data).hexdigest(), "size": len(data), "data": data}
print("files:", len(files))

# 1) upload to file cache FIRST (digest header required)
for rel, f in files.items():
    req = urllib.request.Request(
        "https://api.vercel.com/v2/files", data=f["data"], method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/octet-stream",
            "x-vercel-digest": f["sha"],
            "x-now-digest": f["sha"],
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            r.read()
    except urllib.error.HTTPError as e:
        print("CACHE UPLOAD FAIL:", rel, e.code, e.read().decode()[:200]); sys.exit(1)
print("file cache uploaded")

# 2) create deployment referencing shas
st, dep = api("POST", "/v13/deployments?skipAutoDetectionConfirmation=1", {
    "name": "macadamia-outbound-engine",
    "project": proj["id"],
    "target": "production",
    "files": [{"file": rel, "sha": f["sha"], "size": f["size"]} for rel, f in files.items()],
})
if st not in (200, 201):
    print("DEPLOY FAIL:", st, json.dumps(dep)[:400]); sys.exit(1)
print("deployment:", dep["id"], dep.get("readyState"))

# 3) poll
for i in range(50):
    time.sleep(6)
    stP, d = api("GET", f"/v13/deployments/{dep['id']}")
    state = d.get("readyState")
    if state == "READY":
        print("LIVE_URL: https://" + d["url"]); break
    if state in ("ERROR", "CANCELED"):
        print("BUILD ERROR:")
        stB, builds = api("GET", f"/v13/deployments/{dep['id']}/events" if False else f"/v6/deployments/{dep['id']}/events")
        ev = builds if isinstance(builds, list) else builds.get("events", builds.get("payload", []))
        try:
            for e in ev:
                if e.get("type") in ("stderr", "stdout"):
                    print("  ", e.get("text", "")[:200])
        except Exception:
            pass
        print(json.dumps(d.get("errorMessage", ""))[:300]); sys.exit(1)
    print("  building…", state)
else:
    print("TIMEOUT"); sys.exit(1)
