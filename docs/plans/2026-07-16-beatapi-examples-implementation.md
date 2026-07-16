# BeatAPI Examples Repository Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a private, publication-ready BeatAPI developer examples repository with runnable cURL, Node.js, and Python integrations.

**Architecture:** Keep the commercial application private and expose only the reviewed HTTP contract and developer-facing examples. Use dependency-free reference clients with injected transports so CI never consumes credits or requires secrets.

**Tech Stack:** Node.js 20, Python 3.11, Bash/cURL, OpenAPI 3.1, GitHub Actions.

---

### Task 1: Establish repository contracts

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `tests/repository-contract.test.mjs`

1. Write tests for required public files and forbidden internal paths.
2. Run `npm test` and confirm the repository contract fails.
3. Add the minimum project metadata needed by the test runner.
4. Re-run the test suite.

### Task 2: Implement the Node.js reference client

**Files:**
- Test: `tests/node-client.test.mjs`
- Create: `examples/node/lib/beatapi.mjs`
- Create: `examples/node/music-video.mjs`
- Create: `examples/node/ecommerce-video.mjs`
- Create: `examples/node/upload-file.mjs`

1. Write failing tests for authentication, request envelopes, public errors,
   task polling, and polling timeout.
2. Run the tests and confirm they fail because the client is missing.
3. Implement the smallest dependency-free client that passes.
4. Add executable workflow examples and re-run tests.

### Task 3: Implement webhook verification

**Files:**
- Test: `tests/webhook.test.mjs`
- Create: `examples/node/lib/webhook.mjs`
- Create: `examples/node/webhook-server.mjs`

1. Write failing tests for valid signatures, invalid signatures, and stale
   timestamps.
2. Run the tests and confirm the verifier is missing.
3. Implement HMAC-SHA256 verification with constant-time comparison.
4. Re-run tests.

### Task 4: Implement the Python reference client

**Files:**
- Test: `tests/test_python_client.py`
- Create: `examples/python/beatapi.py`
- Create: `examples/python/music_video.py`
- Create: `examples/python/ecommerce_video.py`
- Create: `examples/python/upload_file.py`

1. Write failing unittest cases matching the Node.js client contract.
2. Run `python3 -m unittest discover -s tests -p 'test_*.py'`.
3. Implement the standard-library client with injectable transport and sleep.
4. Re-run Python tests.

### Task 5: Add public integration assets

**Files:**
- Create: `examples/curl/music-video.sh`
- Create: `examples/curl/ecommerce-video.sh`
- Create: `examples/curl/poll-task.sh`
- Create: `examples/curl/upload-file.sh`
- Create: `fixtures/*.json`
- Create: `openapi/beatapi.yaml`
- Create: `integrations/n8n/README.md`
- Create: `integrations/postman/README.md`

1. Add shell examples using environment variables and public URLs.
2. Add sanitized success, failure, and webhook fixtures.
3. Copy the reviewed public OpenAPI contract.
4. Add links and import instructions for n8n and Postman.
5. Run syntax and repository-contract checks.

### Task 6: Create the developer landing page

**Files:**
- Create: `README.md`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `LICENSE`
- Create: `.github/workflows/verify.yml`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/example_request.yml`

1. Write the five-minute quickstart and async lifecycle explanation.
2. Document supported examples, API-key safety, and support routes.
3. Add MIT licensing for original example code.
4. Add CI for Node tests, Python tests, shell syntax, and Python compilation.
5. Run all checks locally.

### Task 7: Publish privately

1. Review `git diff --check`, tracked files, and secret scans.
2. Run the full verification suite.
3. Commit the repository.
4. Create private `BeatAPI/beatapi-examples`.
5. Push `main` and verify remote visibility and Actions state.
