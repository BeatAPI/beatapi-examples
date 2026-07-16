import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

let resolveDefaultServiceRepository;
let syncOpenApi;
try {
  ({ resolveDefaultServiceRepository, syncOpenApi } = await import(
    "../scripts/sync-openapi.mjs"
  ));
} catch {
  // The first TDD run proves the sync interface does not exist yet.
}

test("detects a public OpenAPI copy that drifted from the canonical contract", async () => {
  assert.ok(syncOpenApi, "syncOpenApi must be implemented");
  const directory = await mkdtemp(join(tmpdir(), "beatapi-openapi-"));
  const source = join(directory, "canonical.yaml");
  const destination = join(directory, "public.yaml");
  await writeFile(source, "openapi: 3.1.0\ninfo:\n  title: Canonical\n");
  await writeFile(destination, "openapi: 3.1.0\ninfo:\n  title: Drifted\n");

  const result = await syncOpenApi({ source, destination, mode: "check" });

  assert.equal(result.inSync, false);
});

test("copies the canonical OpenAPI contract without changing its bytes", async () => {
  assert.ok(syncOpenApi, "syncOpenApi must be implemented");
  const directory = await mkdtemp(join(tmpdir(), "beatapi-openapi-"));
  const source = join(directory, "canonical.yaml");
  const destination = join(directory, "public.yaml");
  const canonical = "openapi: 3.1.0\ninfo:\n  title: Canonical\n";
  await writeFile(source, canonical);
  await writeFile(destination, "drifted\n");

  const result = await syncOpenApi({ source, destination, mode: "write" });

  assert.equal(result.inSync, true);
  assert.equal(await readFile(destination, "utf8"), canonical);
});

test("resolves the private service repository beside the toolkit folder", async () => {
  assert.ok(
    resolveDefaultServiceRepository,
    "resolveDefaultServiceRepository must be implemented",
  );
  const desktop = await mkdtemp(join(tmpdir(), "beatapi-desktop-"));
  const repositoryRoot = join(
    desktop,
    "BeatAPI-Developer-Toolkit",
    "beatapi-examples",
  );
  const serviceRepository = join(desktop, "API项目");
  await mkdir(join(serviceRepository, "docs"), { recursive: true });
  await writeFile(
    join(serviceRepository, "docs", "openapi.yaml"),
    "openapi: 3.1.0\n",
  );

  assert.equal(
    resolveDefaultServiceRepository(repositoryRoot),
    serviceRepository,
  );
});
