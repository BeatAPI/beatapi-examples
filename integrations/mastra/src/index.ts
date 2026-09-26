import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { Agent } from '@mastra/core/agent';

const apiKey = process.env.BEATAPI_API_KEY;
const modelId = process.env.BEATAPI_MODEL;

if (!apiKey || !modelId) {
  throw new Error('Set BEATAPI_API_KEY and BEATAPI_MODEL before running this example.');
}

// Use an account-enabled text model ID from GET https://api.beatapi.io/v1/models.
const beatapi = createOpenAICompatible({
  name: 'beatapi',
  baseURL: 'https://api.beatapi.io/v1',
  apiKey,
});

const agent = new Agent({
  id: 'beatapi-example',
  name: 'BeatAPI example',
  instructions: 'Answer concisely and say when you do not know.',
  model: beatapi.chatModel(modelId),
});

const prompt = process.argv.slice(2).join(' ') || 'Say hello in one sentence.';
const result = await agent.generate(prompt);
console.log(result.text);
