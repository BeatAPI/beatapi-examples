"""Read-only BeatAPI capability discovery using only the Python standard library."""

import json
import os
import urllib.error
import urllib.request


ORIGIN = os.environ.get("BEATAPI_BASE_URL", "https://api.beatapi.io").rstrip("/")
API_KEY = os.environ.get("BEATAPI_API_KEY")


def call(path, body=None, authenticated=False):
    headers = {"Accept": "application/json"}
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")
    if authenticated and API_KEY:
        headers["Authorization"] = f"Bearer {API_KEY}"
    request = urllib.request.Request(ORIGIN + path, data=data, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)["data"]
    except urllib.error.HTTPError as error:
        payload = json.loads(error.read().decode("utf-8"))
        raise RuntimeError(payload.get("error", {}).get("message", str(error))) from error


if API_KEY:
    usage = call("/v1/usage", authenticated=True)
    print({"authentication": "verified", "object": usage.get("object")})
else:
    print("BEATAPI_API_KEY is not set; running anonymous catalog discovery only.")

page = call(
    "/v1/capabilities/search",
    {"query": "image", "kind": "model", "limit": 5},
)
candidate = next(
    (item for item in page.get("data", []) if item.get("reference", "").startswith("model:")),
    None,
)
if candidate is None:
    raise RuntimeError("No model match; refine the catalog search.")

contract = call(
    "/v1/capabilities/inspect",
    {"reference": candidate["reference"]},
)
print(
    {
        "search": {"count": len(page["data"]), "next_cursor": page.get("next_cursor")},
        "capability": {
            key: contract.get(key)
            for key in ("reference", "title", "status", "execution", "pricing", "validation")
        },
    }
)
