# Connect BeatAPI to Muse

BeatAPI provides a Hosted MCP endpoint for Agent hosts that support remote MCP
with Bearer authentication.

| Setting | Value |
| --- | --- |
| Connector name | `BeatAPI` |
| Connection type | Existing MCP / remote MCP |
| Endpoint | `https://beatapi.io/mcp` |
| Authentication | `Authorization: Bearer <BEATAPI_API_KEY>` |
| Tools | `capabilities_search`, `capabilities_inspect`, `capabilities_run` |

Create a restricted key at <https://beatapi.io/dashboard/apikeys> and enter it
through Muse's secret or credential field. Never paste the key into a prompt,
commit it, or place it in a connector URL.

## Read-only connection check

After connecting, ask Muse to:

1. initialize BeatAPI and list its tools;
2. search `kind: "model"` with a small page size;
3. inspect one actual reference returned by Search;
4. report the contract's execution strategy and validation state without
   starting a task.

Search and Inspect do not execute a paid task. `capabilities_run` with
`operation: "start"` can consume the account's USD balance. Inspect the selected
contract first and confirm any missing scope, budget, or essential settings.
Reuse the same idempotency key when retrying the same start.

## Current capability shape

Model IDs and Data actions are discovered dynamically. Do not copy a static
model list into Muse instructions. Text contracts can direct the Agent to
`POST https://api.beatapi.io/v1/responses`; image, video, Data, and Workflow
contracts declare whether they support Run and whether status polling applies.
Asynchronous status uses the same `capabilities_run` tool with
`operation: "status"`.

## Review status

This guide documents the working connector configuration. It does not claim
that BeatAPI has been submitted to, approved by, or listed in the official Muse
Connector directory. Those are separate states.
