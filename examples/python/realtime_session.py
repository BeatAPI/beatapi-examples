import json
import uuid

from beatapi import BeatAPIClient, BeatAPIError


def main() -> None:
    client = BeatAPIClient()
    session = client.create_realtime_session(
        {
            "max_duration_seconds": 60,
            "allowed_origins": ["https://app.example.com"],
            "metadata": {"example": "python"},
        },
        idempotency_key=str(uuid.uuid4()),
    )
    print(
        json.dumps(
            {
                "id": session["id"],
                "status": session["status"],
                "expires_at": session.get("expires_at"),
                "client_secret_received": bool(session.get("client_secret")),
            },
            indent=2,
        )
    )
    print(
        "Return client_secret only to the exact allowed browser origin; do not log it."
    )


if __name__ == "__main__":
    try:
        main()
    except BeatAPIError as error:
        print(
            f"[{error.status}] {error.code}: {error} "
            f"({error.request_id or 'no request id'})"
        )
        raise SystemExit(1) from error
