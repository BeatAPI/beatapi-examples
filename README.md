# BeatAPI

Official runnable examples for the BeatAPI async AI video API.

[![Verify examples](https://github.com/BeatAPI/beatapi-examples/actions/workflows/verify.yml/badge.svg)](https://github.com/BeatAPI/beatapi-examples/actions/workflows/verify.yml)

[Website](https://beatapi.io/) ·
[API documentation](https://docs.beatapi.io/) ·
[Music Video Playground](https://beatapi.io/music-video-api) ·
[Ecommerce Video Playground](https://beatapi.io/ecommerce-video-api)

BeatAPI gives product teams one workflow API for creating AI music videos and
ecommerce video ads. Submit media and creative direction, receive a task ID,
then poll or use a webhook until the hosted MP4 is ready.

The primary launch route is `POST /v1/music-video/tasks`.

```text
Create task -> queued/processing -> succeeded/failed -> hosted output
```

```mermaid
flowchart LR
  A["Create task"] --> B["queued / processing"]
  B --> C{"Final state?"}
  C -->|No| D["Wait 5-10 seconds"]
  D --> E["GET /v1/tasks/{task_id}"]
  E --> C
  C -->|succeeded| F["Read output.media"]
  C -->|failed| G["Inspect error_code and usage"]
```

> This repository contains examples and a small reference client. It is not a
> versioned SDK and it does not contain the BeatAPI service implementation.

## Five-minute quickstart

Create an API key in the
[BeatAPI dashboard](https://beatapi.io/dashboard/apikeys), then export it:

```bash
export BEATAPI_API_KEY="sk_your_key"
```

Create a Music Video task:

```bash
curl https://api.beatapi.io/v1/music-video/tasks \
  -H "Authorization: Bearer $BEATAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "images": ["https://media.beatapi.io/samples/neon-singer.png"],
    "audio_url": "https://media.beatapi.io/samples/neon-singer-preview.mp3",
    "prompt": "Neon rooftop performance with cinematic light trails.",
    "language": "en",
    "aspect_ratio": "9:16",
    "resolution": "720p",
    "compose_mode": "auto"
  }'
```

The response contains a task ID:

```json
{
  "data": {
    "id": "task_8K2qA",
    "status": "queued"
  }
}
```

Poll it every 5-10 seconds:

```bash
curl https://api.beatapi.io/v1/tasks/task_8K2qA \
  -H "Authorization: Bearer $BEATAPI_API_KEY"
```

Stop polling when the task is `succeeded` or `failed`. Successful output URLs
are available in `data.output.media`.

## Examples

| Example | cURL | Node.js | Python |
| --- | --- | --- | --- |
| Music Video task | [`music-video.sh`](examples/curl/music-video.sh) | [`music-video.mjs`](examples/node/music-video.mjs) | [`music_video.py`](examples/python/music_video.py) |
| Ecommerce Video task | [`ecommerce-video.sh`](examples/curl/ecommerce-video.sh) | [`ecommerce-video.mjs`](examples/node/ecommerce-video.mjs) | [`ecommerce_video.py`](examples/python/ecommerce_video.py) |
| Poll a task | [`poll-task.sh`](examples/curl/poll-task.sh) | reference client | reference client |
| Upload a file | [`upload-file.sh`](examples/curl/upload-file.sh) | [`upload-file.mjs`](examples/node/upload-file.mjs) | [`upload_file.py`](examples/python/upload_file.py) |
| Receive webhooks | — | [`webhook-server.mjs`](examples/node/webhook-server.mjs) | — |

### Node.js

The dependency-free examples require Node.js 20 or newer. Repository
verification requires Node.js 20.19+ or 22.12+.

```bash
node examples/node/music-video.mjs
node examples/node/ecommerce-video.mjs
```

The dependency-free reference client is at
[`examples/node/lib/beatapi.mjs`](examples/node/lib/beatapi.mjs). It shows
Bearer authentication, response-envelope handling, structured API errors,
bounded polling, and jitter.

### Python

Requires Python 3.11 or newer and uses only the standard library.

```bash
python3 examples/python/music_video.py
python3 examples/python/ecommerce_video.py
```

The matching reference client is at
[`examples/python/beatapi.py`](examples/python/beatapi.py).

## Public API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/v1/workflows` | List available workflows |
| `POST` | `/v1/music-video/tasks` | Create a Music Video task |
| `POST` | `/v1/ecommerce-video/tasks` | Create an Ecommerce Video task |
| `GET` | `/v1/tasks/{task_id}` | Poll task status and output |
| `GET` | `/v1/usage` | Read usage, credits, and concurrency |
| `POST` | `/v1/files` | Upload local workflow inputs |
| `GET/POST` | `/v1/webhooks` | List or create webhook endpoints |
| `GET/PATCH/DELETE` | `/v1/webhooks/{id}` | Manage a webhook endpoint |

See the [OpenAPI 3.1 contract](openapi/beatapi.yaml) for complete request and
response schemas.

## Task lifecycle

The most common states are:

- `queued`: accepted and waiting for capacity;
- `processing`: generation is running;
- `storyboard_ready` / `requires_action`: a Music Video task needs shot
  selection;
- `editing` / `composing`: selected shots are being processed;
- `succeeded`: hosted output is ready;
- `failed`: no usable output was produced.

Polling is the simplest integration path. Use a 5-10 second interval with a
small amount of jitter and a bounded attempt count. Webhooks can reduce polling,
but `GET /v1/tasks/{task_id}` remains the source of truth.

## Error handling

BeatAPI uses real HTTP status codes and a stable public error envelope:

```json
{
  "error": {
    "code": "bad_request",
    "message": "The request body is invalid.",
    "request_id": "req_example_error"
  }
}
```

Log the `request_id` when asking for support. Retry network errors and selected
`5xx` responses with backoff. Do not blindly retry validation, authentication,
credit, or concurrency errors.

## Webhooks

Webhook requests include:

```text
X-BeatAPI-Event
X-BeatAPI-Signature
X-BeatAPI-Timestamp
```

Verify the signature against the exact raw request body before parsing JSON,
and reject timestamps older than five minutes. The Node.js receiver example
implements HMAC-SHA256 verification with a constant-time comparison.

The signed JSON body uses `event`, not `type`:

```json
{
  "id": "evt_example_123",
  "event": "task.succeeded",
  "created_at": 1784188934,
  "data": {
    "id": "task_8K2qA",
    "status": "succeeded"
  }
}
```

```bash
export BEATAPI_WEBHOOK_SECRET="whsec_your_secret"
node examples/node/webhook-server.mjs
```

## Integration guides

- [n8n guide and importable bounded-polling workflow](integrations/n8n/README.md)
- [Postman](integrations/postman/README.md)
- [Sanitized response fixtures](fixtures/)
- [Production API reference](https://docs.beatapi.io/)

## API key safety

- Keep API keys on your server, worker, or automation platform.
- Never commit `.env` files or paste keys into browser code.
- Never include credentials in screenshots, exported workflow JSON, or issues.
- Rotate a key immediately if it is exposed.

## Repository scope

This repository intentionally contains only developer-facing examples and the
reviewed public contract. The hosted BeatAPI service, dashboard, billing,
workflow orchestration, and operational infrastructure are maintained
privately.

## Development

Tests use fake transports and fixtures. They do not call production or consume
credits.

```bash
npm test
npm run test:python
npm run verify
```

The public OpenAPI file is synchronized byte-for-byte from the private service
repository:

```bash
npm run sync:openapi
npm run check:openapi-sync
```

Run a read-only production smoke test with:

```bash
npm run smoke:live
```

Without `BEATAPI_API_KEY`, it checks anonymous workflow discovery. When the
environment variable is present, it additionally verifies authenticated
`GET /v1/usage`. The smoke test never creates tasks or consumes credits.

## License

Original example code in this repository is available under the
[MIT License](LICENSE). Use of the hosted BeatAPI service is governed by the
[BeatAPI Terms of Service](https://beatapi.io/terms-of-service).
