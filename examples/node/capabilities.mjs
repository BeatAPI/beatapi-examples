const origin = (process.env.BEATAPI_BASE_URL || "https://api.beatapi.io").replace(/\/+$/, "");
const apiKey = process.env.BEATAPI_API_KEY;

async function call(path, body, authenticated = false) {
  const response = await fetch(origin + path, {
    method: body === undefined ? "GET" : "POST",
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
    headers: {
      accept: "application/json",
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...(authenticated && apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || `BeatAPI ${response.status} at ${path}`);
  }
  return payload.data;
}

if (apiKey) {
  const usage = await call("/v1/usage", undefined, true);
  console.log({ authentication: "verified", object: usage.object });
} else {
  console.error("BEATAPI_API_KEY is not set; running anonymous catalog discovery only.");
}

const page = await call("/v1/capabilities/search", {
  query: "image",
  kind: "model",
  limit: 5,
});
const candidate = page.data?.find((item) => item.reference?.startsWith("model:"));
if (!candidate) throw new Error("No model match; refine the catalog search.");

const contract = await call("/v1/capabilities/inspect", {
  reference: candidate.reference,
});
console.log({
  search: { count: page.data.length, next_cursor: page.next_cursor },
  capability: {
    reference: contract.reference,
    title: contract.title,
    status: contract.status,
    execution: contract.execution,
    pricing: contract.pricing,
    validation: contract.validation,
  },
});
