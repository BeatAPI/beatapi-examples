// Execute an explicitly supplied Run envelope. Search and Inspect first.
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { BeatAPIClient } from "./lib/beatapi.mjs";
if (!process.argv[2])
	throw new Error("Usage: node examples/node/run-capability.mjs request.json");
const request = JSON.parse(await readFile(process.argv[2], "utf8"));
if (!request.reference)
	throw new Error("Copy reference from Search or Inspect.");
if (!request.operation || request.operation === "start")
	request.idempotency_key ??= randomUUID();
const result = await new BeatAPIClient().runCapability(request);
console.log(JSON.stringify(result, null, 2));
// For an async task, reuse reference and poll operation=status with task_id.
// For a truncated sync result, use operation=result with result_ref.request_id.
