#!/usr/bin/env bash
set -euo pipefail

: "${BEATAPI_API_KEY:?Set BEATAPI_API_KEY before running this example.}"
BASE_URL="${BEATAPI_BASE_URL:-https://api.beatapi.io}"

curl --fail-with-body --silent --show-error \
  "${BASE_URL}/v1/ecommerce-video/tasks" \
  -H "Authorization: Bearer ${BEATAPI_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{
    "images": ["https://media.beatapi.io/samples/smart-bottle.png"],
    "duration": 15,
    "prompt": "Create a fast hero ad for a smart water bottle.",
    "aspect_ratio": "9:16",
    "language": "en"
  }'
