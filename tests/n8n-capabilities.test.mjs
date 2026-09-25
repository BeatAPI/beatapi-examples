import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const source = await readFile("integrations/n8n/beatapi-capabilities.json", "utf8");
const workflow = JSON.parse(source);

function buildRequest(input) {
  const node = workflow.nodes.find((item) => item.name === "Build Capability Request");
  const run = new vm.Script(`(function () { ${node.parameters.jsCode} })()`);
  return run.runInNewContext({ $input: { first: () => ({ json: input }) } })[0].json;
}

test("n8n workflow has no embedded credential and builds capability calls", () => {
  const names = new Set(workflow.nodes.map((node) => node.name));
  assert.equal(workflow.active, false);
  assert.ok(names.has("BeatAPI Capability API"));
  assert.doesNotMatch(source, /sk_[A-Za-z0-9_-]{8,}/);
  assert.ok(workflow.nodes.every((node) => !node.credentials));
  const http = workflow.nodes.find((node) => node.name === "BeatAPI Capability API");
  assert.equal(http.parameters.authentication, "genericCredentialType");
  assert.equal(http.parameters.genericAuthType, "httpHeaderAuth");
  assert.ok(http.parameters.headerParameters.parameters.some((header) => header.name === "User-Agent"));

  const search = buildRequest({ operation: "search", query: "text model", kind: "model" });
  assert.equal(search.url, "https://api.beatapi.io/v1/capabilities/search");
  assert.equal(search.body.query, "text model");

  const inspect = buildRequest({ operation: "inspect", reference: "model:gpt-5.6-luna" });
  assert.equal(inspect.url, "https://api.beatapi.io/v1/capabilities/inspect");
  assert.equal(inspect.body.reference, "model:gpt-5.6-luna");

  const start = buildRequest({ operation: "start", reference: "model:gpt-5.6-luna", input: { input: "Hello" } });
  assert.equal(start.body.operation, "start");
  assert.equal(start.body.input.input, "Hello");

  const status = buildRequest({ operation: "status", reference: "model:seedance-2-mini", task_id: "task_123" });
  assert.equal(status.body.operation, "status");
  assert.equal(status.body.task_id, "task_123");
  const result = buildRequest({ operation: "result", reference: "data:web.search", request_id: "req_123" });
  assert.equal(result.body.operation, "result");
  assert.equal(result.body.request_id, "req_123");
  assert.throws(() => buildRequest({ operation: "start", input: {} }), /inspected reference/);
});
