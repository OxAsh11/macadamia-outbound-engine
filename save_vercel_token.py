#!/usr/bin/env python3
"""Append VERCEL_TOKEN to the hermes .env (idempotent), without printing it."""
ENV = r"C:/Users/Ashish Mishra/AppData/Local/hermes/.env"
import sys
tok = sys.argv[1].strip()
lines = open(ENV, encoding="utf-8", errors="ignore").read().splitlines()
lines = [l for l in lines if not l.startswith("VERCEL_TOKEN=")]
if tok:
    lines.append(f"VERCEL_TOKEN={tok}")
open(ENV, "w", encoding="utf-8", errors="ignore").write("\n".join(lines) + "\n")
print("VERCEL_TOKEN saved to hermes .env: yes")
