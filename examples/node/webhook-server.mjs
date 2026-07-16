import { createServer } from "node:http";
import {
  describeBeatAPIWebhookEvent,
  verifyBeatAPIWebhook,
} from "./lib/webhook.mjs";

const secret = process.env.BEATAPI_WEBHOOK_SECRET;
const maxBodyBytes = 1024 * 1024;
if (!secret) {
  throw new Error("BEATAPI_WEBHOOK_SECRET is required.");
}

const server = createServer((request, response) => {
  if (request.method !== "POST" || request.url !== "/webhooks/beatapi") {
    response.writeHead(404).end("Not found");
    return;
  }

  const chunks = [];
  let bodyBytes = 0;
  let bodyTooLarge = false;
  request.on("data", (chunk) => {
    if (bodyTooLarge) return;
    bodyBytes += chunk.length;
    if (bodyBytes > maxBodyBytes) {
      bodyTooLarge = true;
      response.writeHead(413).end("Payload too large");
      request.destroy();
      return;
    }
    chunks.push(chunk);
  });
  request.on("end", () => {
    if (bodyTooLarge) return;
    const rawBody = Buffer.concat(chunks).toString("utf8");
    const valid = verifyBeatAPIWebhook({
      rawBody,
      secret,
      signature: request.headers["x-beatapi-signature"],
      timestamp: request.headers["x-beatapi-timestamp"],
    });

    if (!valid) {
      response.writeHead(401).end("Invalid signature");
      return;
    }

    try {
      const event = JSON.parse(rawBody);
      console.log(`Received ${describeBeatAPIWebhookEvent(event)}`);
      response.writeHead(204).end();
    } catch {
      response.writeHead(400).end("Invalid JSON");
    }
  });
});

server.listen(3000, () => {
  console.log("Webhook receiver listening on http://localhost:3000");
});
