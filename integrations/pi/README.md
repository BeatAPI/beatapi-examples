# BeatAPI in Pi

Pi's current documentation recommends `models.json` for a provider that
already speaks OpenAI Responses. This example registers three BeatAPI text
models through that supported route without installing executable extension
code. It is a user-managed Pi configuration. For a one-command install, use
the separate [Pi BeatAPI Provider](https://github.com/BeatAPI/pi-beatapi-provider)
extension.

1. Get a BeatAPI key and set `BEATAPI_API_KEY` in the environment that starts Pi.
2. Read `GET https://api.beatapi.io/v1/models` with that key to confirm which
   text model IDs are enabled for your account.
3. Copy the `beatapi` provider object from
   [`models.json.example`](./models.json.example) into the `providers` object in
   `~/.pi/agent/models.json`. Keep only IDs your account lists and merge with
   any providers already present; do not overwrite your existing file.
4. Open Pi's `/model` picker and choose `beatapi/gpt-5.6-terra` (or another
   enabled model). Pi can also start with `pi --provider beatapi --model
   gpt-5.6-terra`.

The cost fields are USD per million tokens from BeatAPI's published pricing
snapshot checked 2026-09-23. Pi's estimate cannot represent the higher price
tier above 272K input tokens, other conditional pricing, or later price
changes. Check [current BeatAPI pricing](https://beatapi.io/pricing) and the
BeatAPI dashboard usage record before relying on those estimates. The sample
contains no credential; `$BEATAPI_API_KEY` is resolved by Pi at runtime.

This configuration covers text models only. BeatAPI Social Data, tools, image,
and video operations use different capability or asynchronous task contracts.
