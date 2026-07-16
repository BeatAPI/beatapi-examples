# BeatAPI Examples Repository Design

## Purpose

This repository is the public developer edge of BeatAPI. It helps a developer
go from an API key to a completed async video task without exposing the private
BeatAPI application, billing system, provider routing, database, or deployment
configuration.

The repository starts private while its examples and public contract are
validated. It is designed to become public later without a source-history
cleanup.

## Product Boundary

The repository contains:

- the reviewed public OpenAPI contract;
- runnable cURL, Node.js, and Python examples;
- Music Video and Ecommerce Video workflow examples;
- polling, error-handling, file-upload, and webhook verification examples;
- sanitized request, response, and webhook fixtures;
- tests and CI that do not require a real API key.

The repository does not contain:

- BeatAPI website or dashboard source;
- ShipAny-derived source code;
- database schemas or migrations;
- billing, credits, provider pools, admin operations, or internal pricing;
- Cloudflare, Supabase, R2, Redis, or production-secret configuration;
- real API keys, webhook secrets, customer data, or provider identifiers.

## Architecture

The examples use standard HTTP primitives instead of a published SDK. Node.js
examples require Node 20 and use built-in `fetch`. Python examples require
Python 3.11 and use the standard library. Both reference clients support the
same developer loop:

1. Create a workflow task.
2. Read the returned task ID.
3. Poll with bounded retries until a terminal status.
4. Return hosted output media or a structured API error.

Webhook verification is a separate utility because receivers must verify the
raw request body before parsing JSON. Fixtures let tests and documentation show
realistic output without making paid generation requests.

## Reliability and Security

- API keys are read only from `BEATAPI_API_KEY`.
- Examples reject missing keys before making network calls.
- Errors preserve HTTP status, public error code, message, and request ID.
- Polling stops on terminal states and enforces a maximum attempt count.
- Webhook signatures use HMAC-SHA256 and constant-time comparison.
- Webhook timestamps outside a five-minute tolerance are rejected.
- CI runs entirely against injected transports and fixtures.

## Success Criteria

- A developer can clone the repository and run a quickstart in under five
  minutes after adding an API key.
- Node.js and Python examples expose matching workflow behavior.
- Tests cover successful requests, structured failures, polling, timeouts, and
  webhook verification.
- The copied OpenAPI contract is clearly identified as the source of truth.
- No file depends on or reveals private BeatAPI implementation details.
