import { fileURLToPath } from "node:url";

async function readJson(response, label) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.error?.message ||
      `${label} failed with HTTP ${response.status}.`;
    throw new Error(message);
  }
  return payload;
}

export async function runLiveSmoke({
  baseUrl = process.env.BEATAPI_BASE_URL || "https://api.beatapi.io",
  apiKey = process.env.BEATAPI_API_KEY,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new Error("A fetch implementation is required.");
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const workflowResponse = await fetchImpl(
    `${normalizedBaseUrl}/v1/workflows`,
    {
      headers: { accept: "application/json" },
    },
  );
  const workflowPayload = await readJson(
    workflowResponse,
    "Workflow discovery",
  );
  const workflows = workflowPayload?.data?.data;
  if (
    workflowPayload?.data?.object !== "list" ||
    !Array.isArray(workflows) ||
    workflows.length === 0
  ) {
    throw new Error("Workflow discovery returned an unexpected response.");
  }

  let authenticatedUsageChecked = false;
  if (apiKey) {
    const usageResponse = await fetchImpl(`${normalizedBaseUrl}/v1/usage`, {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${apiKey}`,
      },
    });
    const usagePayload = await readJson(usageResponse, "Usage check");
    if (usagePayload?.data?.object !== "usage") {
      throw new Error("Usage check returned an unexpected response.");
    }
    authenticatedUsageChecked = true;
  }

  return {
    workflowCount: workflows.length,
    authenticatedUsageChecked,
  };
}

async function main() {
  const result = await runLiveSmoke();
  console.log(
    `Live smoke passed: ${result.workflowCount} workflows; authenticated usage ${
      result.authenticatedUsageChecked ? "checked" : "skipped (no API key)"
    }.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
