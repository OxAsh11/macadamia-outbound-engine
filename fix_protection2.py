#!/usr/bin/env python3
"""Kill Deployment Protection — try every documented endpoint/shape."""
import json, urllib.request, urllib.error

ENV = r"C:/Users/Ashish Mishra/AppData/Local/hermes/.env"
token = [l.split("=", 1)[1].strip() for l in open(ENV, encoding="utf-8", errors="ignore") if l.startswith("VERCEL_TOKEN=")][0]
PID = "prj_pzbHGwJwhjz3ZN0P9ROJrZ4sN5hR"

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

# A) v1 protection endpoint with project ID
for shape in ({"protection": "none"}, {"protection": {"standard": None}}, {"disable": True}):
    st, resp = api("PATCH", f"/v1/deployment-protection/config/{PID}", shape)
    print("A v1 PATCH", json.dumps(shape)[:60], "->", st, json.dumps(resp)[:160])
    if st in (200, 201):
        break

# B) GET the protection config to learn the schema
st, resp = api("GET", f"/v1/deployment-protection/config/{PID}")
print("B GET v1 config:", st, json.dumps(resp)[:300])

# C) account/user-level: find global flag
st, user = api("GET", "/v2/user")
uid = user.get("user", {}).get("id")
print("C user id:", uid)
st, teams = api("GET", "/v2/teams")
for t in teams.get("teams", [])[:3]:
    print("  team:", t.get("id"), t.get("slug"))
    st2, tinfo = api("GET", f"/v2/teams/{t.get('id')}")
    blob = json.dumps(tinfo)
    if "rotection" in blob:
        idx = blob.find("rotection")
        print("   protection-ish:", blob[max(0, idx-60):idx+200])
