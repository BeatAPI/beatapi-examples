# OpenAPI contract

[`beatapi.yaml`](./beatapi.yaml) is a byte-for-byte published copy of the
canonical `docs/openapi.yaml` contract in the private BeatAPI service
repository. The rendered production API reference is available at
[docs.beatapi.io](https://docs.beatapi.io/).

From the normal desktop layout, synchronize and verify it with:

```bash
npm run sync:openapi
npm run check:openapi-sync
```

Set `BEATAPI_SERVICE_REPO=/absolute/path/to/service-repo` when the private
repository is stored somewhere other than `../API项目`.

Do not add internal routes, provider fields, operational configuration, or
unreleased API shapes directly to this copy. Make contract changes in the
service repository, verify them against the implementation, and then run the
sync command.
