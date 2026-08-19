#!/usr/bin/env bash
set -euo pipefail

: "${BEATAPI_API_KEY:?Set BEATAPI_API_KEY before running this example.}"
: "${BEATAPI_EFFECT_ID:?Set BEATAPI_EFFECT_ID from GET /v1/effects.}"
: "${BEATAPI_EFFECT_IMAGE_URL:?Set a public HTTPS image URL accepted by the Effect.}"
BASE_URL="${BEATAPI_BASE_URL:-https://api.beatapi.io}"

curl --fail-with-body --silent --show-error \
  "${BASE_URL}/v1/effects/${BEATAPI_EFFECT_ID}"

curl --fail-with-body --silent --show-error \
  "${BASE_URL}/v1/effects/tasks" \
  -X POST \
  -H "Authorization: Bearer ${BEATAPI_API_KEY}" \
  -H "Idempotency-Key: effect-example-${BEATAPI_EFFECT_ID}" \
  -H "Content-Type: application/json" \
  --data "{
    \"effect_id\": \"${BEATAPI_EFFECT_ID}\",
    \"images\": [\"${BEATAPI_EFFECT_IMAGE_URL}\"]
  }"
