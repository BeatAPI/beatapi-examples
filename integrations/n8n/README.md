# n8n

BeatAPI works with standard n8n HTTP Request nodes. A minimal workflow uses:

```text
Trigger
  -> HTTP Request: POST /v1/music-video/tasks
  -> Wait: 5-10 seconds
  -> HTTP Request: GET /v1/tasks/{{ task_id }}
  -> If succeeded/failed, finish; otherwise loop to Wait
```

Create an n8n Header Auth credential:

```text
Name: Authorization
Value: Bearer <your BeatAPI API key>
```

Keep the credential in n8n's credential store. Do not paste a real key into an
exported workflow JSON.

For task creation, set the HTTP Request node to:

```text
Method: POST
URL: https://api.beatapi.io/v1/music-video/tasks
Body Content Type: JSON
```

Polling remains the source of truth even when a production workflow also uses
BeatAPI webhooks.
