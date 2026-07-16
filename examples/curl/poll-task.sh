#!/usr/bin/env bash
set -euo pipefail

: "${BEATAPI_API_KEY:?Set BEATAPI_API_KEY before running this example.}"
: "${1:?Usage: ./examples/curl/poll-task.sh task_id}"
BASE_URL="${BEATAPI_BASE_URL:-https://api.beatapi.io}"
TASK_ID="$1"

curl --fail-with-body --silent --show-error \
  "${BASE_URL}/v1/tasks/${TASK_ID}" \
  -H "Authorization: Bearer ${BEATAPI_API_KEY}"
