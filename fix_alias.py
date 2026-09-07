#!/usr/bin/env python3
"""Fix the canonical alias: find the READY deployment under the renamed project
and assign the production alias macadamia-outbound-engine.vercel.app to it."""
import json, urllib.request, urllib.error, sys

ENV = r"C:/Users/Ashish Mishra/AppData/Local/hermes/.env"
token = [l.split("=", 1)[1].strip() for l in open(ENV, encoding="utf-8", errors="ignore") if l.startswith("VERCEL_TOKEN=")][0]

def api(method, path, data=None):
    req = urllib.request.Request(
        f"https://api.vercel.com{path}",
        data=json.dumps(data).encode() if data is not None else None,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.load(e)
        except Exception:
            return e.code, {"raw": e.read().decode()[:200]}

# 1) project info (confirm rename took)
st, proj = api("GET", "/v9/projects/macadamia-outbound-engine")
print("project:", st, proj.get("name"), proj.get("id"))

# 2) its deployments (v6 list works for this)
st, deps = api("GET", "/v6/deployments?projectId=" + proj["id"] + "&limit=10")
ready = [d for d in deps.get("deployments", []) if d.get("state") == "READY"]
print("deployments:", [(d["uid"][:12], d.get("state")) for d in deps.get("deployments", [])])
if not ready:
    print("NO READY DEPLOYMENT"); sys.exit(1)
dep = ready[0]
print("target deployment:", dep["uid"])

# 3) assign alias
st, resp = api("POST", f"/v2/deployments/{dep['uid']}/aliases", {"alias": "macadamia-outbound-engine"})
print("alias assign:", st, json.dumps(resp)[:250])
