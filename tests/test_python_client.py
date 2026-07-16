import json
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "examples", "python"))

try:
    from beatapi import BeatAPIClient, BeatAPIError
except ModuleNotFoundError:
    BeatAPIClient = None
    BeatAPIError = None


class Response:
    def __init__(self, status, body):
        self.status = status
        self._body = json.dumps(body).encode()

    def read(self):
        return self._body

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False


class BeatAPIClientTests(unittest.TestCase):
    def test_requires_api_key(self):
        self.assertIsNotNone(BeatAPIClient, "BeatAPIClient must be implemented")
        with self.assertRaisesRegex(ValueError, "BEATAPI_API_KEY"):
            BeatAPIClient(api_key="")

    def test_creates_music_video_task(self):
        self.assertIsNotNone(BeatAPIClient, "BeatAPIClient must be implemented")
        captured = {}

        def transport(request):
            captured["request"] = request
            return Response(201, {"data": {"id": "task_123", "status": "queued"}})

        client = BeatAPIClient(api_key="sk_test", transport=transport)
        task = client.create_music_video_task(
            {
                "images": ["https://example.com/image.png"],
                "audio_url": "https://example.com/audio.mp3",
            }
        )

        self.assertEqual(task["id"], "task_123")
        self.assertEqual(
            captured["request"].full_url,
            "https://api.beatapi.io/v1/music-video/tasks",
        )
        self.assertEqual(
            captured["request"].get_header("Authorization"),
            "Bearer sk_test",
        )

    def test_polls_until_terminal_status(self):
        self.assertIsNotNone(BeatAPIClient, "BeatAPIClient must be implemented")
        statuses = iter(["queued", "processing", "succeeded"])
        sleeps = []

        def transport(_request):
            return Response(
                200,
                {
                    "data": {
                        "id": "task_123",
                        "status": next(statuses),
                    }
                },
            )

        client = BeatAPIClient(
            api_key="sk_test",
            transport=transport,
            sleep=lambda seconds: sleeps.append(seconds),
            random=lambda: 0,
        )
        task = client.wait_for_task("task_123", interval_seconds=0.01, max_attempts=5)

        self.assertEqual(task["status"], "succeeded")
        self.assertEqual(sleeps, [0.01, 0.01])

    def test_preserves_structured_api_error_details(self):
        self.assertIsNotNone(BeatAPIClient, "BeatAPIClient must be implemented")

        def transport(_request):
            return Response(
                422,
                {
                    "error": {
                        "code": "invalid_audio",
                        "message": "Audio URL is invalid.",
                        "request_id": "req_123",
                    }
                },
            )

        client = BeatAPIClient(api_key="sk_test", transport=transport)

        with self.assertRaises(BeatAPIError) as raised:
            client.get_task("task_123")

        self.assertEqual(raised.exception.status, 422)
        self.assertEqual(raised.exception.code, "invalid_audio")
        self.assertEqual(raised.exception.request_id, "req_123")

    def test_stops_polling_after_max_attempts(self):
        self.assertIsNotNone(BeatAPIClient, "BeatAPIClient must be implemented")

        def transport(_request):
            return Response(
                200,
                {"data": {"id": "task_123", "status": "processing"}},
            )

        client = BeatAPIClient(
            api_key="sk_test",
            transport=transport,
            sleep=lambda _seconds: None,
        )

        with self.assertRaisesRegex(TimeoutError, "did not finish after 2 attempts"):
            client.wait_for_task(
                "task_123",
                interval_seconds=0.01,
                max_attempts=2,
            )


if __name__ == "__main__":
    unittest.main()
