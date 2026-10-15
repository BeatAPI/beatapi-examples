# BeatAPI with Mastra

This example gives a Mastra agent one BeatAPI text model through the
OpenAI-compatible Chat Completions route. It uses an explicit AI SDK provider;
it does not add BeatAPI to Mastra's built-in model router or list every BeatAPI
capability in Mastra Studio.

## Run

Requires Node.js 22.13 or later.

```bash
cd integrations/mastra
npm ci
export BEATAPI_API_KEY="<your private BeatAPI key>"
curl https://api.beatapi.io/v1/models \
  -H "Authorization: Bearer $BEATAPI_API_KEY"
export BEATAPI_MODEL="<an enabled text model ID from the response>"
npm start -- "Summarize what an industrial agent should check before acting."
```

The API key remains in the local process. Mastra sends the prompt to BeatAPI's
`POST /v1/chat/completions`; this can consume BeatAPI credits. For reasoning,
tools, and other model-specific features, verify the exact model and request
contract before relying on them in an agent workflow.

`npm run check` verifies the TypeScript integration. A successful type check is
not proof of a live model call; run the example with your own account-enabled
model to verify that path.
