import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function resolveDefaultServiceRepository(root = repositoryRoot) {
  const candidates = [
    resolve(root, "..", "API项目"),
    resolve(root, "..", "..", "API项目"),
  ];
  return (
    candidates.find((candidate) =>
      existsSync(resolve(candidate, "docs", "openapi.yaml")),
    ) ?? candidates[0]
  );
}

export async function syncOpenApi({ source, destination, mode }) {
  if (mode !== "check" && mode !== "write") {
    throw new Error(`Unsupported OpenAPI sync mode: ${mode}`);
  }

  const canonical = await readFile(source);
  const current = await readFile(destination).catch(() => null);
  const inSync = current !== null && canonical.equals(current);

  if (mode === "write" && !inSync) {
    await writeFile(destination, canonical);
    return { inSync: true, changed: true };
  }

  return { inSync, changed: false };
}

async function main() {
  const mode = process.argv.includes("--check") ? "check" : "write";
  const serviceRepository =
    process.env.BEATAPI_SERVICE_REPO ||
    resolveDefaultServiceRepository();
  const source = resolve(serviceRepository, "docs", "openapi.yaml");
  const destination = resolve(repositoryRoot, "openapi", "beatapi.yaml");
  const result = await syncOpenApi({ source, destination, mode });

  if (mode === "check" && !result.inSync) {
    console.error(
      `OpenAPI drift detected. Run npm run sync:openapi using ${source}.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    result.changed
      ? `Synced ${source} -> ${destination}`
      : `OpenAPI contract is in sync with ${source}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
