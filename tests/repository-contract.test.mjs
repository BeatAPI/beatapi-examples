import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const requiredFiles = [
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "openapi/beatapi.yaml",
  "examples/curl/music-video.sh",
  "examples/curl/realtime-session.sh",
  "examples/node/music-video.mjs",
  "examples/node/realtime-session.mjs",
  "examples/python/music_video.py",
  "examples/python/realtime_session.py",
  "examples/browser/realtime-video.ts",
  "examples/node/webhook-server.mjs",
  "fixtures/task-succeeded.json",
  "integrations/n8n/beatapi-music-video.json",
  ".github/dependabot.yml",
  ".github/pull_request_template.md",
  ".github/workflows/live-smoke.yml",
  ".github/workflows/verify.yml",
];

test("contains the publication-ready developer entrypoints", async () => {
  const missing = [];

  for (const file of requiredFiles) {
    try {
      await access(file);
    } catch {
      missing.push(file);
    }
  }

  assert.deepEqual(missing, []);
});

test("documents the public API without internal implementation names", async () => {
  const readme = await readFile("README.md", "utf8").catch(() => "");

  assert.match(readme, /https:\/\/api\.beatapi\.io/);
  assert.match(readme, /POST \/v1\/music-video\/tasks/);
  assert.match(readme, /`POST` \| `\/v1\/realtime\/sessions`/);
  assert.doesNotMatch(readme, /ShipAny|Hyperdrive|Supabase|Upstash|Vidu/i);
});

test("music video quickstarts explicitly use the public auto-compose contract", async () => {
  const files = [
    "README.md",
    "examples/curl/music-video.sh",
    "examples/node/music-video.mjs",
    "examples/python/music_video.py",
    "integrations/n8n/beatapi-music-video.json",
  ];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.match(
      source,
      /compose_mode["']?\s*[:=]\s*["']auto["']/,
      `${file} must opt into compose_mode=auto`,
    );
  }
});
