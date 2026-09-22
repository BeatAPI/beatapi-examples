import assert from "node:assert/strict";
import test from "node:test";

let runLiveSmoke;
try {
  ({ runLiveSmoke } = await import("../scripts/smoke-live.mjs"));
} catch {
  // The first TDD run proves the smoke-test interface does not exist yet.
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("checks workflow discovery without requiring an API key", async () => {
  assert.ok(runLiveSmoke, "runLiveSmoke must be implemented");
  const requests = [];
  const result = await runLiveSmoke({
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      if (url.endsWith("/v1/workflows")) {
        return jsonResponse(200, {
          data: {
            object: "list",
            data: [{ id: "music-video" }, { id: "ecommerce-video" }],
          },
        });
      }
      if (url.endsWith("/v1/capabilities/search")) {
        return jsonResponse(200, {
          data: {
            object: "capability.list",
            data: [{ reference: "model:example-image" }],
            next_cursor: "",
          },
        });
      }
      return jsonResponse(200, {
        data: { reference: "model:example-image", execution: { mode: "async" } },
      });
    },
  });

  assert.equal(result.workflowCount, 2);
  assert.equal(result.capabilityCount, 1);
  assert.equal(result.inspectedReference, "model:example-image");
  assert.equal(result.authenticatedUsageChecked, false);
  assert.equal(requests.length, 3);
});

test("checks the read-only usage endpoint when an API key is available", async () => {
  assert.ok(runLiveSmoke, "runLiveSmoke must be implemented");
  const requests = [];
  const result = await runLiveSmoke({
    apiKey: "sk_test",
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      if (url.endsWith("/v1/workflows")) {
        return jsonResponse(200, {
          data: {
            object: "list",
            data: [{ id: "music-video" }, { id: "ecommerce-video" }],
          },
        });
      }
      if (url.endsWith("/v1/capabilities/search")) {
        return jsonResponse(200, {
          data: {
            object: "capability.list",
            data: [{ reference: "model:example-image" }],
            next_cursor: "",
          },
        });
      }
      if (url.endsWith("/v1/capabilities/inspect")) {
        return jsonResponse(200, {
          data: { reference: "model:example-image", execution: { mode: "async" } },
        });
      }
      return jsonResponse(200, {
        data: {
          object: "usage",
          credit_balance: 50,
          total_tasks: 0,
          credits_settled: 0,
          credits_refunded: 0,
          concurrency: { limit: 1, active: 0 },
          by_workflow: [],
        },
      });
    },
  });

  assert.equal(result.authenticatedUsageChecked, true);
  assert.equal(
    requests[3].init.headers.authorization,
    "Bearer sk_test",
  );
});
