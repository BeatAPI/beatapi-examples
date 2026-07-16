import { openAsBlob } from "node:fs";
import { basename, resolve } from "node:path";
import { BeatAPIClient } from "./lib/beatapi.mjs";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node examples/node/upload-file.mjs <file>");
  process.exit(1);
}

const absolutePath = resolve(inputPath);
const file = await openAsBlob(absolutePath);
const uploaded = await new BeatAPIClient().uploadFile(
  file,
  basename(absolutePath),
);

console.log(JSON.stringify(uploaded, null, 2));
