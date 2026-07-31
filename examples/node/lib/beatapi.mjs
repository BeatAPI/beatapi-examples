const TERMINAL_STATUSES = new Set(["succeeded", "failed"]);

export class BeatAPIError extends Error {
  constructor(message, { status, code, requestId, details } = {}) {
    super(message);
    this.name = "BeatAPIError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

export class BeatAPIClient {
  constructor({
    apiKey = process.env.BEATAPI_API_KEY,
    baseUrl = process.env.BEATAPI_BASE_URL || "https://api.beatapi.io",
    fetchImpl = globalThis.fetch,
    sleep = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
    random = Math.random,
  } = {}) {
    if (!apiKey) {
      throw new Error(
        "BEATAPI_API_KEY is required. Create a key in the BeatAPI dashboard.",
      );
    }
    if (typeof fetchImpl !== "function") {
      throw new Error("A fetch implementation is required.");
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.fetch = fetchImpl;
    this.sleep = sleep;
    this.random = random;
  }

  async request(path, { method = "GET", body, headers = {} } = {}) {
    const requestHeaders = {
      accept: "application/json",
      authorization: `Bearer ${this.apiKey}`,
      ...headers,
    };
    let requestBody = body;

    if (body !== undefined && !(body instanceof FormData)) {
      requestHeaders["content-type"] = "application/json";
      requestBody = JSON.stringify(body);
    }

    const response = await this.fetch(`${this.baseUrl}${path}`, {
      method,
      headers: requestHeaders,
      body: requestBody,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = payload.error || {};
      throw new BeatAPIError(
        error.message || `BeatAPI request failed with HTTP ${response.status}.`,
        {
          status: response.status,
          code: error.code,
          requestId: error.request_id,
          details: error.details,
        },
      );
    }

    return payload.data;
  }

  createMusicVideoTask(input) {
    return this.request("/v1/music-video/tasks", {
      method: "POST",
      body: input,
    });
  }

  createEcommerceVideoTask(input) {
    return this.request("/v1/ecommerce-video/tasks", {
      method: "POST",
      body: input,
    });
  }

  createRealtimeSession(input, { idempotencyKey } = {}) {
    if (!idempotencyKey) {
      throw new TypeError("idempotencyKey is required.");
    }
    return this.request("/v1/realtime/sessions", {
      method: "POST",
      body: input,
      headers: { "idempotency-key": idempotencyKey },
    });
  }

  getRealtimeSession(sessionId) {
    return this.request(
      `/v1/realtime/sessions/${encodeURIComponent(sessionId)}`,
    );
  }

  closeRealtimeSession(sessionId) {
    return this.request(
      `/v1/realtime/sessions/${encodeURIComponent(sessionId)}`,
      { method: "DELETE" },
    );
  }

  getTask(taskId) {
    return this.request(`/v1/tasks/${encodeURIComponent(taskId)}`);
  }

  getUsage() {
    return this.request("/v1/usage");
  }

  uploadFile(file, filename = file?.name || "upload.bin") {
    const form = new FormData();
    form.append("file", file, filename);
    return this.request("/v1/files", {
      method: "POST",
      body: form,
    });
  }

  async waitForTask(
    taskId,
    { intervalMs = 5_000, maxAttempts = 120, onUpdate } = {},
  ) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const task = await this.getTask(taskId);
      onUpdate?.(task, attempt);

      if (TERMINAL_STATUSES.has(task.status)) {
        return task;
      }

      if (attempt < maxAttempts) {
        const jitter = Math.floor(intervalMs * 0.2 * this.random());
        await this.sleep(intervalMs + jitter);
      }
    }

    throw new Error(
      `Task ${taskId} did not finish after ${maxAttempts} attempts.`,
    );
  }
}
