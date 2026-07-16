import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

let verifyBeatAPIWebhook;
try {
  ({ verifyBeatAPIWebhook } = await import(
    "../examples/node/lib/webhook.mjs"
  ));
} catch {
  // The first TDD run proves the implementation does not exist yet.
}

const secret = "whsec_test";
const rawBody = '{"type":"task.succeeded","data":{"id":"task_123"}}';
const timestamp = "1784187600";
const signature = createHmac("sha256", secret)
  .update(`${timestamp}.${rawBody}`)
  .digest("hex");

test("accepts a valid webhook signature inside the replay window", () => {
  assert.ok(verifyBeatAPIWebhook, "webhook verifier must be implemented");
  assert.equal(
    verifyBeatAPIWebhook({
      rawBody,
      secret,
      signature,
      timestamp,
      nowSeconds: Number(timestamp) + 30,
    }),
    true,
  );
});

test("rejects an invalid signature", () => {
  assert.ok(verifyBeatAPIWebhook, "webhook verifier must be implemented");
  assert.equal(
    verifyBeatAPIWebhook({
      rawBody,
      secret,
      signature: "0".repeat(64),
      timestamp,
      nowSeconds: Number(timestamp) + 30,
    }),
    false,
  );
});

test("rejects a stale webhook timestamp", () => {
  assert.ok(verifyBeatAPIWebhook, "webhook verifier must be implemented");
  assert.equal(
    verifyBeatAPIWebhook({
      rawBody,
      secret,
      signature,
      timestamp,
      nowSeconds: Number(timestamp) + 301,
    }),
    false,
  );
});
