import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse as parseYaml } from "yaml";

const contract = parseYaml(await readFile("openapi/beatapi.yaml", "utf8"));
const ajv = new Ajv2020({
  allErrors: true,
  allowUnionTypes: true,
  strict: false,
});
addFormats(ajv);

function validatorFor(schemaName) {
  return ajv.compile({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    components: contract.components,
    $ref: `#/components/schemas/${schemaName}`,
  });
}

async function readFixture(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

const fixtureContracts = [
  ["fixtures/task-created.json", "TaskResponse"],
  ["fixtures/task-succeeded.json", "TaskResponse"],
  ["fixtures/task-failed.json", "TaskResponse"],
  ["fixtures/webhook-task-succeeded.json", "WebhookEvent"],
  ["fixtures/api-error.json", "Error"],
  ["fixtures/realtime-session-created.json", "RealtimeSessionResponse"],
];

for (const [fixturePath, schemaName] of fixtureContracts) {
  test(`${fixturePath} matches the ${schemaName} public contract`, async () => {
    const fixture = await readFixture(fixturePath);
    const validate = validatorFor(schemaName);

    assert.equal(
      validate(fixture),
      true,
      ajv.errorsText(validate.errors, { separator: "\n" }),
    );
  });
}
