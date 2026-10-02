"""Execute a supplied Run envelope; discover and inspect before a paid start."""
import json
import sys
import uuid
from beatapi import BeatAPIClient

if len(sys.argv) != 2:
    raise SystemExit("Usage: python3 examples/python/run_capability.py request.json")
with open(sys.argv[1], encoding="utf-8") as source:
    request = json.load(source)
if not request.get("reference"):
    raise ValueError("Copy reference from Search or Inspect.")
if request.get("operation", "start") == "start":
    request.setdefault("idempotency_key", str(uuid.uuid4()))
print(json.dumps(BeatAPIClient().run_capability(request), ensure_ascii=False, indent=2))
