import { randomUUID } from "node:crypto";

import { BeatAPIClient, BeatAPIError } from "./lib/beatapi.mjs";

const client = new BeatAPIClient();

try {
  const session = await client.createRealtimeSession(
    {
      max_duration_seconds: 60,
      allowed_origins: ["https://app.example.com"],
      metadata: { example: "node" },
    },
    { idempotencyKey: randomUUID() },
  );

  console.log(JSON.stringify({
    id: session.id,
    status: session.status,
    expires_at: session.expires_at,
    client_secret_received: Boolean(session.client_secret),
  }, null, 2));
  console.log("Return client_secret only to the exact allowed browser origin; do not log it.");
} catch (error) {
  if (error instanceof BeatAPIError) {
    console.error(
      `[${error.status}] ${error.code}: ${error.message} (${error.requestId || "no request id"})`,
    );
  } else {
    console.error(error);
  }
  process.exitCode = 1;
}
