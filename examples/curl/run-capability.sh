#!/usr/bin/env bash
set -euo pipefail
: "${BEATAPI_API_KEY:?Set BEATAPI_API_KEY privately}"
request_file="${1:?Pass a JSON Run envelope copied from Inspect}"
curl --fail-with-body --silent --show-error --max-time 100 \
  "${BEATAPI_BASE_URL:-https://api.beatapi.io}/v1/capabilities/run" \
  -H "Authorization: Bearer ${BEATAPI_API_KEY}" \
  -H 'Content-Type: application/json' --data-binary "@${request_file}"
