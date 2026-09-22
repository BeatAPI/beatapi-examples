#!/usr/bin/env bash
set -euo pipefail

api_origin="${BEATAPI_BASE_URL:-https://api.beatapi.io}"

if ! command -v jq >/dev/null 2>&1; then
  echo "This example requires jq." >&2
  exit 1
fi

if [[ -n "${BEATAPI_API_KEY:-}" ]]; then
  curl --fail-with-body --silent --show-error \
    "${api_origin}/v1/usage" \
    -H "Authorization: Bearer ${BEATAPI_API_KEY}" \
    | jq '{authentication: "verified", object: .data.object}'
else
  echo 'BEATAPI_API_KEY is not set; running anonymous catalog discovery only.' >&2
fi

search_result="$(curl --fail-with-body --silent --show-error \
  "${api_origin}/v1/capabilities/search" \
  -H 'Content-Type: application/json' \
  -d '{"query":"image","kind":"model","limit":5}')"

echo "${search_result}" | jq '.data | {object, data, next_cursor}'

reference="$(echo "${search_result}" | jq -er '.data.data[0].reference')"
curl --fail-with-body --silent --show-error \
  "${api_origin}/v1/capabilities/inspect" \
  -H 'Content-Type: application/json' \
  -d "$(jq -cn --arg reference "${reference}" '{reference: $reference}')" \
  | jq '.data | {reference, title, status, execution, pricing, validation}'
