# n8n

## Choose an entry point

| Need | n8n entry point |
| --- | --- |
| Text model in an AI Agent or LLM Chain | Use n8n's built-in **OpenAI Chat Model**. Create an OpenAI credential with your BeatAPI key and Base URL `https://api.beatapi.io/v1`; choose a model ID returned by `GET /v1/models`. No community node is required. |
| Image or video model | Use the capability workflow below with `search`, `inspect`, `start`, and `status`. Image and video calls may return an asynchronous task ID. |
| Public social research | Import one of the specific Social Data workflows below. They use n8n's built-in HTTP Request node and a Header Auth credential. |

### Social Data research workflows

- [Research public X keyword conversations](./beatapi-x-keyword-research.json): retrieve a preview of recent posts and draft an evidence-based theme summary.
- [Compare two public Instagram profiles](./beatapi-instagram-profile-compare.json): compare visible profile metadata without claiming performance from follower counts.
- [Find themes in public YouTube comments](./beatapi-youtube-comment-themes.json): summarize a comment preview and retain comment IDs for review.

Each workflow has a **Configure Inputs** node and a setup sticky note. Create one
Header Auth credential with name `Authorization` and value `Bearer <your BeatAPI
API key>`; assign it to both HTTP Request nodes. The social request and text
summary use BeatAPI credits. The exports have no credential IDs or API keys.
The summaries are research drafts based on a small preview, with source IDs
available for manual verification.

## All BeatAPI capabilities

Import [`beatapi-capabilities.json`](./beatapi-capabilities.json) for a reusable
Search → Inspect → Run workflow. It discovers current text, image, video,
social-data, and web capabilities instead of hard-coding a model list. In the
**Configure Request** node, choose `search`, `inspect`, `start`, `status`, or
`result`. Search and Inspect are free; starting a run may use BeatAPI credits.

Create a Header Auth credential in n8n with header name `Authorization` and
value `Bearer <your BeatAPI API key>`, then assign it to the **BeatAPI Capability
API** HTTP Request node. The export does not contain an API key or a credential
ID. Inspect the selected reference before filling the `input` object for a
start. For image and video, poll the returned `task_id` with `status`; for a
stored synchronous result, use its `request_id` with `result`.

The workflow uses built-in nodes, so it does not require an n8n community-node
installation. It is an importable workflow, not a native BeatAPI node.

## Music video example

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
