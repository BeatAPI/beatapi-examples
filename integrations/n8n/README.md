# n8n

BeatAPI works with standard n8n HTTP Request nodes. A minimal workflow uses:

```text
Trigger
  -> HTTP Request: POST /v1/music-video/tasks
  -> Wait: 5-10 seconds
  -> HTTP Request: GET /v1/tasks/{{ task_id }}
  -> If succeeded/failed, finish; otherwise loop to Wait
```

For a ready-to-import bounded polling workflow, download
[`beatapi-music-video.json`](./beatapi-music-video.json) and import it into n8n.
It checks at most 120 times at ten-second intervals and fails explicitly when
the polling window is exhausted.

Create an n8n Header Auth credential:

```text
Name: Authorization
Value: Bearer <your BeatAPI API key>
```

Keep the credential in n8n's credential store. Do not paste a real key into an
exported workflow JSON.

After importing the workflow, assign that Header Auth credential to both
`Create BeatAPI Task` and `Poll BeatAPI Task`. Then edit `Configure Inputs` to
use your own public image and audio URLs.

For task creation, set the HTTP Request node to:

```text
Method: POST
URL: https://api.beatapi.io/v1/music-video/tasks
Body Content Type: JSON
```

Polling remains the source of truth even when a production workflow also uses
BeatAPI webhooks.
