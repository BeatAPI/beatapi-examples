# Contributing

Contributions that make BeatAPI integrations easier to understand and run are
welcome.

## Good contributions

- a focused example for a common server runtime or automation tool;
- clearer error-handling or polling guidance;
- a fix that keeps an example aligned with the public OpenAPI contract;
- a sanitized fixture that demonstrates a documented public response.

Please do not submit private service implementation guesses, undocumented
routes, provider-specific fields, generated marketing pages, or real
credentials.

## Local checks

Requires Node.js 20+ and Python 3.11+:

```bash
npm install
npm run verify
git diff --check
```

Tests must not make paid API requests. Inject a fake transport or use fixtures.

## Pull requests

Keep pull requests small. Explain:

1. which developer problem the example solves;
2. how to run it;
3. which public endpoint or schema it demonstrates;
4. how you verified it without exposing credentials.

By contributing, you agree that your contribution is licensed under the MIT
License.
