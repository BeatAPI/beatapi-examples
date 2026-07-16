import { BeatAPIClient, BeatAPIError } from "./lib/beatapi.mjs";

const client = new BeatAPIClient();

try {
  const created = await client.createMusicVideoTask({
    images: ["https://media.beatapi.io/samples/neon-singer.png"],
    audio_url:
      "https://media.beatapi.io/samples/neon-singer-preview.mp3",
    prompt: "Neon rooftop performance with cinematic light trails.",
    language: "en",
    aspect_ratio: "9:16",
    resolution: "720p",
  });

  console.log(`Created ${created.id}`);

  const completed = await client.waitForTask(created.id, {
    onUpdate: (task) => console.log(`${task.id}: ${task.status}`),
  });

  if (completed.status === "failed") {
    console.error(completed.error_message || "Generation failed.");
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify(completed.output, null, 2));
  }
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
