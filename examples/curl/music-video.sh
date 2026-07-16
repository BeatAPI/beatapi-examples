#!/usr/bin/env bash
set -euo pipefail

: "${BEATAPI_API_KEY:?Set BEATAPI_API_KEY before running this example.}"
BASE_URL="${BEATAPI_BASE_URL:-https://api.beatapi.io}"

curl --fail-with-body --silent --show-error \
  "${BASE_URL}/v1/music-video/tasks" \
  -H "Authorization: Bearer ${BEATAPI_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{
    "images": ["https://media.beatapi.io/samples/neon-singer.png"],
    "audio_url": "https://media.beatapi.io/samples/neon-singer-preview.mp3",
    "prompt": "Neon rooftop performance with cinematic light trails.",
    "language": "en",
    "aspect_ratio": "9:16",
    "resolution": "720p"
  }'
