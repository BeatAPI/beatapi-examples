import assert from "node:assert/strict";
import test from "node:test";

let BeatAPIClient;
let BeatAPIError;
try {
  ({ BeatAPIClient, BeatAPIError } = await import(
    "../examples/node/lib/beatapi.mjs"
  ));
} catch {
  // The first TDD run proves the implementation does not exist yet.
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("requires an API key before making authenticated requests", () => {
  assert.ok(BeatAPIClient, "BeatAPIClient must be implemented");
  assert.throws(() => new BeatAPIClient({ apiKey: "" }), /BEATAPI_API_KEY/);
});

test("creates a music video task with bearer authentication", async () => {
  assert.ok(BeatAPIClient, "BeatAPIClient must be implemented");
  let captured;
  const client = new BeatAPIClient({
    apiKey: "sk_test",
    fetchImpl: async (url, init) => {
      captured = { url, init };
      return jsonResponse(201, { data: { id: "task_123", status: "queued" } });
    },
  });

  const task = await client.createMusicVideoTask({
    images: ["https://example.com/image.png"],
    audio_url: "https://example.com/audio.mp3",
  });

  assert.equal(task.id, "task_123");
  assert.equal(captured.url, "https://api.beatapi.io/v1/music-video/tasks");
  assert.equal(captured.init.headers.authorization, "Bearer sk_test");
  assert.equal(captured.init.method, "POST");
});

test("preserves structured API error details", async () => {
  assert.ok(BeatAPIClient, "BeatAPIClient must be implemented");
  const client = new BeatAPIClient({
    apiKey: "sk_test",
    fetchImpl: async () =>
      jsonResponse(422, {
        error: {
          code: "invalid_audio",
          message: "Audio URL is invalid.",
          request_id: "req_123",
        },
      }),
  });

  await assert.rejects(
    () => client.getTask("task_123"),
    (error) => {
      assert.ok(error instanceof BeatAPIError);
      assert.equal(error.status, 422);
      assert.equal(error.code, "invalid_audio");
      assert.equal(error.requestId, "req_123");
      return true;
    },
  );
});

test("polls until the task reaches a terminal status", async () => {
  assert.ok(BeatAPIClient, "BeatAPIClient must be implemented");
  const statuses = ["queued", "processing", "succeeded"];
  const sleeps = [];
  const client = new BeatAPIClient({
    apiKey: "sk_test",
    fetchImpl: async () =>
      jsonResponse(200, {
        data: {
          id: "task_123",
          status: statuses.shift(),
          output: { media: [{ url: "https://media.example.com/result.mp4" }] },
        },
      }),
    sleep: async (milliseconds) => sleeps.push(milliseconds),
    random: () => 0,
  });

  const task = await client.waitForTask("task_123", {
    intervalMs: 10,
    maxAttempts: 5,
  });

  assert.equal(task.status, "succeeded");
  assert.deepEqual(sleeps, [10, 10]);
});

test("stops polling after the configured maximum attempts", async () => {
  assert.ok(BeatAPIClient, "BeatAPIClient must be implemented");
  const client = new BeatAPIClient({
    apiKey: "sk_test",
    fetchImpl: async () =>
      jsonResponse(200, { data: { id: "task_123", status: "processing" } }),
    sleep: async () => {},
  });

  await assert.rejects(
    () =>
      client.waitForTask("task_123", {
        intervalMs: 1,
        maxAttempts: 2,
      }),
    /did not finish after 2 attempts/,
  );
});
