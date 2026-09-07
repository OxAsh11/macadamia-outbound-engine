#!/usr/bin/env python3
"""Disable Vercel Deployment Protection (SSO) via the dedicated endpoint."""
import json, urllib.request, urllib.error

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
            return e.code, {"raw": e.read().decode()[:300]}

# current state
st, proj = api("GET", "/v9/projects/macadamia-outbound-engine")
print("current protection:", json.dumps(proj.get("protection") or proj.get("deploymentProtection") or "unset"))

# the correct field names on PATCH /v9/projects: protection (v9) — try both shapes
for payload in (
    {"protection": "none"},
    {"deploymentProtection": {"productionAccess": "public", "previewAccess": "public"}},
):
    st, resp = api("PATCH", "/v9/projects/macadamia-outbound-engine", payload)
    err = (resp.get("error") or {}).get("message", "none")
    print("PATCH", list(payload.keys()), "->", st, err if err != "none" else "OK")

# dedicated endpoint (v1)
st, resp = api("PATCH", "/v1/deployment-protection/config/macadamia-outbound-engine", {"protection": "none"})
print("v1 protection endpoint:", st, json.dumps(resp)[:200])
