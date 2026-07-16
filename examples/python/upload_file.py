"""Upload example using curl-compatible multipart encoding from the stdlib."""

import json
import mimetypes
import os
import sys
import urllib.request
import uuid
from pathlib import Path


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 examples/python/upload_file.py <file>")

    api_key = os.getenv("BEATAPI_API_KEY")
    if not api_key:
        raise SystemExit("BEATAPI_API_KEY is required.")

    path = Path(sys.argv[1])
    safe_filename = path.name.replace("\r", "").replace("\n", "").replace('"', "")
    boundary = f"beatapi-{uuid.uuid4().hex}"
    mime_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{safe_filename}"\r\n'
        f"Content-Type: {mime_type}\r\n\r\n"
    ).encode() + path.read_bytes() + f"\r\n--{boundary}--\r\n".encode()

    request = urllib.request.Request(
        f"{os.getenv('BEATAPI_BASE_URL', 'https://api.beatapi.io')}/v1/files",
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    with urllib.request.urlopen(request) as response:
        print(json.dumps(json.load(response), indent=2))


if __name__ == "__main__":
    main()
