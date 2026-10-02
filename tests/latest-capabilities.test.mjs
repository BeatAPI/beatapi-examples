import assert from "node:assert/strict";
import test from "node:test";
import { BeatAPIClient } from "../examples/node/lib/beatapi.mjs";

test("reference client preserves sync raw results and async next instructions", async () => {
	const client = new BeatAPIClient({
		apiKey: "fixture",
		fetchImpl: async (_url, init) => {
			const request = JSON.parse(init.body);
			return Response.json(
				request.operation === "status"
					? {
							data: { id: "task_fixture", status: "processing" },
							next: { action: "status" },
						}
					: {
							object: "web.search",
							items: [],
							result_ref: { request_id: "req_fixture" },
						},
			);
		},
	});
	assert.equal(
		(
			await client.runCapability({
				reference: "data:web.search",
				input: { query: "test" },
			})
		).object,
		"web.search",
	);
	assert.equal(
		(
			await client.runCapability({
				reference: "data:web.research",
				operation: "status",
				task_id: "task_fixture",
			})
		).next.action,
		"status",
	);
});
