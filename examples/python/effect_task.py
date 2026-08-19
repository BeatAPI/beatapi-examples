import json
import os
import uuid

from beatapi import BeatAPIClient


effect_id = os.environ["BEATAPI_EFFECT_ID"]
image_url = os.environ["BEATAPI_EFFECT_IMAGE_URL"]
client = BeatAPIClient()
print(json.dumps(client.get_effect(effect_id), indent=2))
task = client.create_effect_task(
    {"effect_id": effect_id, "images": [image_url]},
    idempotency_key=str(uuid.uuid4()),
)
print(f"Created {task['id']}")
print(json.dumps(client.wait_for_task(task["id"]), indent=2))
