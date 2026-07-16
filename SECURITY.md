# Security Policy

## Reporting a vulnerability

Do not open a public issue for vulnerabilities, exposed API keys, authentication
problems, webhook bypasses, credit issues, or customer data.

Report security concerns privately by emailing support@beatapi.io. Include the
affected endpoint, impact, reproduction steps, and relevant request IDs. Remove
API keys, webhook secrets, personal data, and private media URLs from the
report.

GitHub private vulnerability reporting can be enabled when this repository
becomes public. Until then, do not use a public issue for a security report.

## API key exposure

If a BeatAPI key is committed, pasted into an issue, or otherwise exposed:

1. revoke or rotate it immediately in the BeatAPI dashboard;
2. remove it from the current file;
3. clean it from repository history before making the repository public;
4. do not rely on deleting only the latest commit.

All examples in this repository use environment variables and placeholder
credentials.
