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

test("covers generation model discovery, image, video, and Effect routes", async () => {
  const requests = [];
  const client = new BeatAPIClient({
    apiKey: "sk_test",
    fetchImpl: async (url, init) => {
      requests.push({
        method: init.method,
        path: new URL(url).pathname + new URL(url).search,
        body: init.body ? JSON.parse(init.body) : undefined,
        idempotencyKey: init.headers["idempotency-key"],
      });
      if (new URL(url).pathname === "/v1/media/models") {
        return jsonResponse(200, {
          data: { object: "list", data: [{ id: "nano-banana" }] },
        });
      }
      if (new URL(url).pathname === "/v1/effects") {
        return jsonResponse(200, {
          data: { object: "list", data: [{ id: "video-muscle-max" }] },
        });
      }
      return jsonResponse(201, { data: { id: "task_test" } });
    },
  });

  assert.deepEqual(await client.listGenerationModels(), [{ id: "nano-banana" }]);
  await client.createImageTask({ model: "nano-banana", prompt: "Editorial still" });
  await client.createVideoTask({ model: "seedance-2-mini", prompt: "Slow orbit" });
  assert.deepEqual(await client.listEffects({ outputType: "video" }), [
    { id: "video-muscle-max" },
  ]);
  await client.getEffect("video/muscle");
  await client.createEffectTask(
    {
      effect_id: "video-muscle-max",
      images: ["https://media.example.com/portrait.png"],
    },
    { idempotencyKey: "effect-request-123" },
  );

  assert.deepEqual(requests, [
    { method: "GET", path: "/v1/media/models", body: undefined, idempotencyKey: undefined },
    {
      method: "POST",
      path: "/v1/images/tasks",
      body: { model: "nano-banana", prompt: "Editorial still" },
      idempotencyKey: undefined,
    },
    {
      method: "POST",
      path: "/v1/videos/tasks",
      body: { model: "seedance-2-mini", prompt: "Slow orbit" },
      idempotencyKey: undefined,
    },
    {
      method: "GET",
      path: "/v1/effects?output_type=video",
      body: undefined,
      idempotencyKey: undefined,
    },
    {
      method: "GET",
      path: "/v1/effects/video%2Fmuscle",
      body: undefined,
      idempotencyKey: undefined,
    },
    {
      method: "POST",
      path: "/v1/effects/tasks",
      body: {
        effect_id: "video-muscle-max",
        images: ["https://media.example.com/portrait.png"],
      },
      idempotencyKey: "effect-request-123",
    },
  ]);
});

test("creates a realtime session with an idempotency key", async () => {
  assert.ok(BeatAPIClient, "BeatAPIClient must be implemented");
  let captured;
  const client = new BeatAPIClient({
    apiKey: "sk_test",
    fetchImpl: async (url, init) => {
      captured = { url, init };
      return jsonResponse(201, {
        data: {
          id: "rts_test",
          object: "realtime.session",
          status: "ready",
          client_secret: "brt_live_test",
        },
      });
    },
  });

  const session = await client.createRealtimeSession(
    {
      max_duration_seconds: 60,
      allowed_origins: ["https://app.example.com"],
    },
    { idempotencyKey: "customer-call-123" },
  );

  assert.equal(session.id, "rts_test");
  assert.equal(captured.url, "https://api.beatapi.io/v1/realtime/sessions");
  assert.equal(captured.init.method, "POST");
  assert.equal(
    captured.init.headers["idempotency-key"],
    "customer-call-123",
  );
});

test("gets and closes a realtime session by encoded id", async () => {
  const requests = [];
  const client = new BeatAPIClient({
    apiKey: "sk_test",
    fetchImpl: async (url, init) => {
      requests.push({
        path: new URL(url).pathname,
        method: init.method,
      });
      return jsonResponse(200, {
        data: { id: "rts_test", object: "realtime.session", status: "closed" },
      });
    },
  });

  await client.getRealtimeSession("rts_test/value");
  await client.closeRealtimeSession("rts_test/value");

  assert.deepEqual(requests, [
    { path: "/v1/realtime/sessions/rts_test%2Fvalue", method: "GET" },
    { path: "/v1/realtime/sessions/rts_test%2Fvalue", method: "DELETE" },
  ]);
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
