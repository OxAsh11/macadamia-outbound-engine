#!/usr/bin/env python3
"""Deploy via Vercel CLI using token (no interactive login)."""
import subprocess, sys, os

ENV = r"C:/Users/Ashish Mishra/AppData/Local/hermes/.env"
token = [l.split("=", 1)[1].strip() for l in open(ENV, encoding="utf-8", errors="ignore") if l.startswith("VERCEL_TOKEN=")][0]
APP = r"C:/Users/Ashish Mishra/macadamia-app"

env = dict(os.environ)
env["VERCEL_TOKEN"] = token
env["VERCEL_ORG_ID"] = ""  # let CLI resolve

r = subprocess.run(
    ["vercel", "deploy", "--prod", "--yes", "--token", token, "--name", "macadamia-outbound-engine"],
    cwd=APP, capture_output=True, text=True, timeout=540, env=env, shell=True,
)
print("RC:", r.returncode)
print("OUT:", r.stdout[-2000:])
print("ERR:", r.stderr[-800:])
