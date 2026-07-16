import { createHmac, timingSafeEqual } from "node:crypto";

export function describeBeatAPIWebhookEvent(payload) {
  const event = payload?.event || "unknown event";
  const taskId = payload?.data?.id || "unknown task";
  return `${event} for ${taskId}`;
}

export function verifyBeatAPIWebhook({
  rawBody,
  secret,
  signature,
  timestamp,
  nowSeconds = Math.floor(Date.now() / 1000),
  toleranceSeconds = 300,
}) {
  if (!rawBody || !secret || !signature || !timestamp) {
    return false;
  }

  const parsedTimestamp = Number(timestamp);
  if (!Number.isFinite(parsedTimestamp)) {
    return false;
  }

  const ageSeconds = Math.abs(nowSeconds - parsedTimestamp);
  if (ageSeconds > toleranceSeconds) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
