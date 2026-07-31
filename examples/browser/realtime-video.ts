import { createRealtimeClient } from "@beatapi/realtime";

type SessionResponse = {
  data: {
    client_secret: string;
  };
};

const response = await fetch("/api/realtime/session", { method: "POST" });
if (!response.ok) throw new Error("Unable to create a BeatAPI Realtime Session.");
const session = (await response.json()) as SessionResponse;

const input = await navigator.mediaDevices.getUserMedia({ video: true });
const output = document.querySelector<HTMLVideoElement>("#realtime-output");
if (!output) throw new Error("Missing #realtime-output video element.");

const client = createRealtimeClient({
  clientSecret: session.data.client_secret,
});
const connection = await client.connect({
  input,
  output,
  initial: { prompt: "Transform the scene while preserving motion." },
});

await connection.set({
  prompt: "Keep the movement and change the scene to watercolor.",
});

window.addEventListener("pagehide", () => {
  void connection.disconnect();
  input.getTracks().forEach((track) => track.stop());
});
