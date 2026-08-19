#!/usr/bin/env bash
set -euo pipefail

: "${BEATAPI_API_KEY:?Set BEATAPI_API_KEY before running this example.}"
BASE_URL="${BEATAPI_BASE_URL:-https://api.beatapi.io}"

curl --fail-with-body --silent --show-error \
  "${BASE_URL}/v1/images/tasks" \
  -X POST \
  -H "Authorization: Bearer ${BEATAPI_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{
    "model": "nano-banana",
    "prompt": "Editorial product photograph on a warm stone pedestal.",
    "aspect_ratio": "1:1",
    "output_format": "png"
  }'
