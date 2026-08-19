#!/usr/bin/env bash
set -euo pipefail

: "${BEATAPI_API_KEY:?Set BEATAPI_API_KEY before running this example.}"
BASE_URL="${BEATAPI_BASE_URL:-https://api.beatapi.io}"

curl --fail-with-body --silent --show-error \
  "${BASE_URL}/v1/videos/tasks" \
  -X POST \
  -H "Authorization: Bearer ${BEATAPI_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{
    "model": "seedance-2-mini",
    "prompt": "A slow cinematic orbit around a glass sculpture at sunrise.",
    "duration": 5,
    "aspect_ratio": "16:9",
    "resolution": "720p"
  }'
