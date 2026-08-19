import json

from beatapi import BeatAPIClient


client = BeatAPIClient()
task = client.create_image_task(
    {
        "model": "nano-banana",
        "prompt": "Editorial product photograph on a warm stone pedestal.",
        "aspect_ratio": "1:1",
        "output_format": "png",
    }
)
print(f"Created {task['id']}")
print(json.dumps(client.wait_for_task(task["id"]), indent=2))
