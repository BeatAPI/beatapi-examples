import { randomUUID } from "node:crypto";
import { BeatAPIClient } from "./lib/beatapi.mjs";

const effectId = process.env.BEATAPI_EFFECT_ID;
const imageUrl = process.env.BEATAPI_EFFECT_IMAGE_URL;
if (!effectId || !imageUrl) {
  throw new Error("Set BEATAPI_EFFECT_ID and BEATAPI_EFFECT_IMAGE_URL first.");
}

const client = new BeatAPIClient();
console.log(JSON.stringify(await client.getEffect(effectId), null, 2));
const task = await client.createEffectTask(
  { effect_id: effectId, images: [imageUrl] },
  { idempotencyKey: randomUUID() },
);
console.log(`Created ${task.id}`);
console.log(JSON.stringify(await client.waitForTask(task.id), null, 2));
