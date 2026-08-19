import json

from beatapi import BeatAPIClient


client = BeatAPIClient()
task = client.create_video_task(
    {
        "model": "seedance-2-mini",
        "prompt": "A slow cinematic orbit around a glass sculpture at sunrise.",
        "duration": 5,
        "aspect_ratio": "16:9",
        "resolution": "720p",
    }
)
print(f"Created {task['id']}")
print(json.dumps(client.wait_for_task(task["id"]), indent=2))
