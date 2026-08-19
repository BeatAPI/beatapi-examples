import { BeatAPIClient } from "./lib/beatapi.mjs";

const client = new BeatAPIClient();
const task = await client.createImageTask({
  model: "nano-banana",
  prompt: "Editorial product photograph on a warm stone pedestal.",
  aspect_ratio: "1:1",
  output_format: "png",
});

console.log(`Created ${task.id}`);
console.log(JSON.stringify(await client.waitForTask(task.id), null, 2));
