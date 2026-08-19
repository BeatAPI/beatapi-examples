import { BeatAPIClient } from "./lib/beatapi.mjs";

const client = new BeatAPIClient();
const task = await client.createVideoTask({
  model: "seedance-2-mini",
  prompt: "A slow cinematic orbit around a glass sculpture at sunrise.",
  duration: 5,
  aspect_ratio: "16:9",
  resolution: "720p",
});

console.log(`Created ${task.id}`);
console.log(JSON.stringify(await client.waitForTask(task.id), null, 2));
