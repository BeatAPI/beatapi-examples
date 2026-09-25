import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";

const templates = [
  ["beatapi-x-keyword-research.json", "data:twitter.web.fetch_search_timeline"],
  ["beatapi-instagram-profile-compare.json", "data:instagram.fetch_user_info_by_username_v3"],
  ["beatapi-youtube-comment-themes.json", "data:youtube.web_v2.get_video_comments"],
];

async function load(name) {
  return JSON.parse(await readFile(`integrations/n8n/${name}`, "utf8"));
}

function runCode(workflow, name, inputs, config = {}) {
  const node = workflow.nodes.find((item) => item.name === name);
  const script = new vm.Script(`(function () { ${node.parameters.jsCode} })()`);
  const context = {
    $input: { first: () => ({ json: inputs[0] }), all: () => inputs.map((json) => ({ json })) },
    $: () => ({ first: () => ({ json: config }) }),
  };
  return script.runInNewContext(context);
}

test("social templates contain no secrets and keep text and data calls separate", async () => {
  for (const [file, reference] of templates) {
    const source = await readFile(`integrations/n8n/${file}`, "utf8");
    const workflow = JSON.parse(source);
    assert.ok(workflow.id && workflow.versionId, file);
    assert.equal(workflow.active, false, file);
    assert.ok(workflow.nodes.every((node) => !node.credentials), file);
    assert.doesNotMatch(source, /sk_[A-Za-z0-9_-]{8,}/, file);
    assert.ok(workflow.nodes.some((node) => node.type === "n8n-nodes-base.stickyNote"), file);
    const social = workflow.nodes.find((node) => node.name === "Fetch Public Social Data");
    const text = workflow.nodes.find((node) => node.name === "Summarize with BeatAPI Text Model");
    assert.equal(social.parameters.url, "https://api.beatapi.io/v1/capabilities/run", file);
    assert.ok(social.parameters.jsonBody.includes(reference), file);
    assert.equal(text.parameters.url, "https://api.beatapi.io/v1/chat/completions", file);
    assert.equal(social.parameters.genericAuthType, "httpHeaderAuth", file);
    assert.equal(text.parameters.genericAuthType, "httpHeaderAuth", file);
  }
});

test("X and YouTube templates retain source IDs for review", async () => {
  const x = await load(templates[0][0]);
  const xResult = runCode(x, "Prepare Evidence", [
    { status: "succeeded", request_id: "req-x", items: [{ tweet_id: "post-1", screen_name: "example", text: "A public post", favorites: 3 }] },
  ], { keyword: "AI agents" })[0].json;
  assert.equal(xResult.source_count, 1);
  assert.ok(xResult.prompt.includes("post-1"));
  assert.equal(xResult.request_ids[0], "req-x");

  const youtube = await load(templates[2][0]);
  const ytResult = runCode(youtube, "Prepare Evidence", [
    { status: "succeeded", request_id: "req-y", items: [{ comment_id: "comment-1", content: "A public comment", author: { display_name: "example" } }] },
  ], { video_id: "dQw4w9WgXcQ" })[0].json;
  assert.equal(ytResult.source_count, 1);
  assert.ok(ytResult.prompt.includes("comment-1"));
  assert.equal(ytResult.request_ids[0], "req-y");
});

test("Instagram template rejects a partial comparison", async () => {
  const instagram = await load(templates[1][0]);
  assert.throws(
    () => runCode(instagram, "Prepare Evidence", [{ status: "succeeded", data: { username: "one" } }]),
    /Both public Instagram profiles/,
  );
  const result = runCode(instagram, "Prepare Evidence", [
    { status: "succeeded", request_id: "req-1", data: { username: "one", follower_count: 10 } },
    { status: "succeeded", request_id: "req-2", data: { username: "two", follower_count: 20 } },
  ])[0].json;
  assert.equal(result.source_count, 2);
  assert.deepEqual(Array.from(result.request_ids), ["req-1", "req-2"]);
});
