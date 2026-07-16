import { BeatAPIClient, BeatAPIError } from "./lib/beatapi.mjs";

const client = new BeatAPIClient();

try {
  const created = await client.createEcommerceVideoTask({
    images: ["https://media.beatapi.io/samples/smart-bottle.png"],
    duration: 15,
    prompt: "Create a fast hero ad for a smart water bottle.",
    aspect_ratio: "9:16",
    language: "en",
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
