import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const requiredFiles = [
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "openapi/beatapi.yaml",
  "examples/curl/music-video.sh",
  "examples/node/music-video.mjs",
  "examples/python/music_video.py",
  "examples/node/webhook-server.mjs",
  "fixtures/task-succeeded.json",
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
  assert.doesNotMatch(readme, /ShipAny|Hyperdrive|Supabase|Upstash|Vidu/i);
});
