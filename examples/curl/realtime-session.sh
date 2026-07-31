#!/usr/bin/env bash
set -euo pipefail

: "${BEATAPI_API_KEY:?Set BEATAPI_API_KEY before running this example.}"
BASE_URL="${BEATAPI_BASE_URL:-https://api.beatapi.io}"
IDEMPOTENCY_KEY="${1:-realtime-$(date +%s)}"

curl --fail-with-body --silent --show-error \
  "${BASE_URL}/v1/realtime/sessions" \
  -X POST \
  -H "Authorization: Bearer ${BEATAPI_API_KEY}" \
  -H "Idempotency-Key: ${IDEMPOTENCY_KEY}" \
  -H "Content-Type: application/json" \
  --data '{
    "max_duration_seconds": 60,
    "allowed_origins": ["https://app.example.com"],
    "metadata": {"example": "curl"}
  }'
