"""Small dependency-free BeatAPI reference client.

This module is example code, not an officially versioned SDK.
"""

from __future__ import annotations

import json
import os
import random as random_module
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Callable


TERMINAL_STATUSES = {"succeeded", "failed"}


class BeatAPIError(Exception):
    def __init__(
        self,
        message: str,
        *,
        status: int | None = None,
        code: str | None = None,
        request_id: str | None = None,
        details: Any = None,
    ) -> None:
        super().__init__(message)
        self.status = status
        self.code = code
        self.request_id = request_id
        self.details = details


class BeatAPIClient:
    def __init__(
        self,
        *,
        api_key: str | None = None,
        base_url: str | None = None,
        transport: Callable[[urllib.request.Request], Any] = urllib.request.urlopen,
        sleep: Callable[[float], None] = time.sleep,
        random: Callable[[], float] = random_module.random,
    ) -> None:
        self.api_key = api_key if api_key is not None else os.getenv("BEATAPI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "BEATAPI_API_KEY is required. Create a key in the BeatAPI dashboard."
            )

        self.base_url = (
            base_url or os.getenv("BEATAPI_BASE_URL") or "https://api.beatapi.io"
        ).rstrip("/")
        self.transport = transport
        self.sleep = sleep
        self.random = random

    def request(
        self,
        path: str,
        *,
        method: str = "GET",
        body: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        data = json.dumps(body).encode() if body is not None else None
        request_headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            **(headers or {}),
        }
        if data is not None:
            request_headers["Content-Type"] = "application/json"

        request = urllib.request.Request(
            f"{self.base_url}{path}",
            data=data,
            headers=request_headers,
            method=method,
        )

        try:
            response = self.transport(request)
            with response:
                status = response.status
                payload = json.loads(response.read().decode() or "{}")
        except urllib.error.HTTPError as error:
            status = error.code
            payload = json.loads(error.read().decode() or "{}")

        if status < 200 or status >= 300:
            public_error = payload.get("error", {})
            raise BeatAPIError(
                public_error.get(
                    "message", f"BeatAPI request failed with HTTP {status}."
                ),
                status=status,
                code=public_error.get("code"),
                request_id=public_error.get("request_id"),
                details=public_error.get("details"),
            )

        return payload.get("data")

    def create_music_video_task(self, input_data: dict[str, Any]) -> dict[str, Any]:
        return self.request(
            "/v1/music-video/tasks",
            method="POST",
            body=input_data,
        )

    def create_ecommerce_video_task(
        self, input_data: dict[str, Any]
    ) -> dict[str, Any]:
        return self.request(
            "/v1/ecommerce-video/tasks",
            method="POST",
            body=input_data,
        )

    def create_realtime_session(
        self,
        input_data: dict[str, Any],
        *,
        idempotency_key: str,
    ) -> dict[str, Any]:
        if not idempotency_key:
            raise ValueError("idempotency_key is required")
        return self.request(
            "/v1/realtime/sessions",
            method="POST",
            body=input_data,
            headers={"Idempotency-Key": idempotency_key},
        )

    def get_realtime_session(self, session_id: str) -> dict[str, Any]:
        encoded = urllib.parse.quote(session_id, safe="")
        return self.request(f"/v1/realtime/sessions/{encoded}")

    def close_realtime_session(self, session_id: str) -> dict[str, Any]:
        encoded = urllib.parse.quote(session_id, safe="")
        return self.request(
            f"/v1/realtime/sessions/{encoded}",
            method="DELETE",
        )

    def get_task(self, task_id: str) -> dict[str, Any]:
        return self.request(f"/v1/tasks/{urllib.parse.quote(task_id, safe='')}")

    def get_usage(self) -> dict[str, Any]:
        return self.request("/v1/usage")

    def wait_for_task(
        self,
        task_id: str,
        *,
        interval_seconds: float = 5,
        max_attempts: int = 120,
        on_update: Callable[[dict[str, Any], int], None] | None = None,
    ) -> dict[str, Any]:
        for attempt in range(1, max_attempts + 1):
            task = self.get_task(task_id)
            if on_update:
                on_update(task, attempt)

            if task["status"] in TERMINAL_STATUSES:
                return task

            if attempt < max_attempts:
                jitter = interval_seconds * 0.2 * self.random()
                self.sleep(interval_seconds + jitter)

        raise TimeoutError(
            f"Task {task_id} did not finish after {max_attempts} attempts."
        )
