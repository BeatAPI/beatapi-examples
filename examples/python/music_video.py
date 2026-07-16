import json

from beatapi import BeatAPIClient, BeatAPIError


def main() -> None:
    client = BeatAPIClient()
    created = client.create_music_video_task(
        {
            "images": ["https://media.beatapi.io/samples/neon-singer.png"],
            "audio_url": (
                "https://media.beatapi.io/samples/neon-singer-preview.mp3"
            ),
            "prompt": "Neon rooftop performance with cinematic light trails.",
            "language": "en",
            "aspect_ratio": "9:16",
            "resolution": "720p",
        }
    )
    print(f"Created {created['id']}")

    completed = client.wait_for_task(
        created["id"],
        on_update=lambda task, _attempt: print(
            f"{task['id']}: {task['status']}"
        ),
    )
    print(json.dumps(completed, indent=2))


if __name__ == "__main__":
    try:
        main()
    except BeatAPIError as error:
        print(
            f"[{error.status}] {error.code}: {error} "
            f"({error.request_id or 'no request id'})"
        )
        raise SystemExit(1) from error
