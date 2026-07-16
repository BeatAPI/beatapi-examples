#!/usr/bin/env bash
set -euo pipefail

: "${BEATAPI_API_KEY:?Set BEATAPI_API_KEY before running this example.}"
: "${1:?Usage: ./examples/curl/upload-file.sh path/to/file}"
BASE_URL="${BEATAPI_BASE_URL:-https://api.beatapi.io}"
FILE_PATH="$1"

curl --fail-with-body --silent --show-error \
  "${BASE_URL}/v1/files" \
  -H "Authorization: Bearer ${BEATAPI_API_KEY}" \
  -F "file=@${FILE_PATH}"
