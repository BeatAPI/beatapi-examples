import { createServer } from "node:http";
import { verifyBeatAPIWebhook } from "./lib/webhook.mjs";

const secret = process.env.BEATAPI_WEBHOOK_SECRET;
if (!secret) {
  throw new Error("BEATAPI_WEBHOOK_SECRET is required.");
}

const server = createServer((request, response) => {
  if (request.method !== "POST" || request.url !== "/webhooks/beatapi") {
    response.writeHead(404).end("Not found");
    return;
  }

  const chunks = [];
  request.on("data", (chunk) => chunks.push(chunk));
  request.on("end", () => {
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
      console.log(
        `Received ${event.type} for ${event.data?.id || "unknown task"}`,
      );
      response.writeHead(204).end();
    } catch {
      response.writeHead(400).end("Invalid JSON");
    }
  });
});

server.listen(3000, () => {
  console.log("Webhook receiver listening on http://localhost:3000");
});
