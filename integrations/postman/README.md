# Postman

Use the public
[BeatAPI Postman workspace](https://www.postman.com/kkkk-9098906/beatapi-public-api/overview)
or import [`../../openapi/beatapi.yaml`](../../openapi/beatapi.yaml) into a new
Postman collection.

Set a collection variable named `BEATAPI_API_KEY` and send it as:

```text
Authorization: Bearer {{BEATAPI_API_KEY}}
```

Start with `GET /v1/workflows`, then create a task and save its `data.id` for
`GET /v1/tasks/{task_id}`.
