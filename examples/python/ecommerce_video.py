import json

from beatapi import BeatAPIClient, BeatAPIError


def main() -> None:
    client = BeatAPIClient()
    created = client.create_ecommerce_video_task(
        {
            "images": ["https://media.beatapi.io/samples/smart-bottle.png"],
            "duration": 15,
            "prompt": "Create a fast hero ad for a smart water bottle.",
            "aspect_ratio": "9:16",
            "language": "en",
        }
    )
    print(f"Created {created['id']}")

    completed = client.wait_for_task(
        created["id"],
        on_update=lambda task, _attempt: print(
            f"{task['id']}: {task['status']}"
        ),
    )
    if completed["status"] == "failed":
        raise RuntimeError(
            completed.get("error_message") or "Ecommerce video generation failed."
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
    except RuntimeError as error:
        print(error)
        raise SystemExit(1) from error
