import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowPath = "integrations/n8n/beatapi-music-video.json";

test("ships an importable bounded-polling n8n workflow without credentials", async () => {
  const source = await readFile(workflowPath, "utf8");
  const workflow = JSON.parse(source);
  const nodeTypes = new Set(workflow.nodes.map((node) => node.type));

  assert.equal(workflow.name, "BeatAPI Music Video - Bounded Polling");
  assert.ok(nodeTypes.has("n8n-nodes-base.httpRequest"));
  assert.ok(nodeTypes.has("n8n-nodes-base.wait"));
  assert.ok(nodeTypes.has("n8n-nodes-base.splitInBatches"));
  assert.ok(nodeTypes.has("n8n-nodes-base.if"));
  assert.match(source, /https:\/\/api\.beatapi\.io\/v1\/music-video\/tasks/);
  assert.match(source, /https:\/\/api\.beatapi\.io\/v1\/tasks\//);
  assert.doesNotMatch(source, /sk_[A-Za-z0-9_-]{8,}/);
  assert.doesNotMatch(source, /"credentials"\s*:/);
});
