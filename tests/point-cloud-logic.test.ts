import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizePointCloudApiPath,
  pointCloudPathFromEntity,
  pointCloudProblemHint,
  pointCloudProblemFromResponse,
  pointCloudRequestPath,
  signedPathFromResponse,
} from "../src/point-cloud-logic.ts";

test("point-cloud discovery accepts only the integration local API", () => {
  assert.equal(
    pointCloudPathFromEntity({
      attributes: {
        point_cloud_api_path:
          "/api/dreame_lawn_mower/point-cloud/entry_123/2",
      },
    }),
    "/api/dreame_lawn_mower/point-cloud/entry_123/2",
  );
  assert.equal(
    pointCloudPathFromEntity({
      attributes: {
        point_cloud_api_path: "https://vendor.example/private-map.pcd",
      },
    }),
    undefined,
  );
});

test("point-cloud paths reject traversal, query injection, and bad indexes", () => {
  for (const path of [
    "/api/dreame_lawn_mower/point-cloud/../secret/0",
    "/api/dreame_lawn_mower/point-cloud/entry/256",
    "/api/dreame_lawn_mower/point-cloud/entry/-1",
    "/api/dreame_lawn_mower/point-cloud/entry/0?url=https://example.invalid",
    "//example.invalid/api/dreame_lawn_mower/point-cloud/entry/0",
  ]) {
    assert.equal(normalizePointCloudApiPath(path), undefined);
  }
});

test("refresh is added before Home Assistant signs the path", () => {
  const path = "/api/dreame_lawn_mower/point-cloud/entry/0";

  assert.equal(pointCloudRequestPath(path, false), path);
  assert.equal(pointCloudRequestPath(path, true), `${path}?refresh=1`);
});

test("signed path responses remain local", () => {
  assert.equal(
    signedPathFromResponse({ path: "/api/file?authSig=secret" }),
    "/api/file?authSig=secret",
  );
  assert.equal(
    signedPathFromResponse({ path: "https://example.invalid/private" }),
    undefined,
  );
  assert.equal(signedPathFromResponse({}), undefined);
});

test("point-cloud problem responses retain only bounded troubleshooting fields", async () => {
  const response = new Response(
    JSON.stringify({
      schema_version: 1,
      title: "The mower did not publish a fresh 3D map",
      detail: "The mower did not publish a fresh 3D map within 45 seconds.",
      code: "point_cloud_not_published",
      stage: "generation",
      retryable: true,
      retry_after_seconds: 10,
      elapsed_ms: 45012.4,
      timeout_seconds: 45,
      private_url: "https://example.invalid/map?token=secret",
    }),
    {
      status: 504,
      headers: { "Content-Type": "application/problem+json" },
    },
  );

  assert.deepEqual(await pointCloudProblemFromResponse(response), {
    title: "The mower did not publish a fresh 3D map",
    detail: "The mower did not publish a fresh 3D map within 45 seconds.",
    status: 504,
    code: "point_cloud_not_published",
    stage: "generation",
    retryable: true,
    retryAfterSeconds: 10,
    elapsedMs: 45012.4,
    timeoutSeconds: 45,
  });
});

test("point-cloud problem parsing falls back for old or malformed integrations", async () => {
  const oldIntegration = new Response("Bad Gateway", { status: 502 });
  assert.deepEqual(await pointCloudProblemFromResponse(oldIntegration), {
    title: "3D map unavailable",
    detail: "The mower point cloud is unavailable (HTTP 502).",
    status: 502,
    retryable: true,
  });

  const malformed = new Response(
    JSON.stringify({
      title: "Unsafe\nmultiline",
      detail: "x".repeat(500),
      code: "../../secret",
      stage: "generation",
      retryable: false,
    }),
    {
      status: 502,
      headers: { "Content-Type": "application/problem+json" },
    },
  );
  assert.deepEqual(await pointCloudProblemFromResponse(malformed), {
    title: "Unsafe multiline",
    detail: "The mower point cloud is unavailable (HTTP 502).",
    status: 502,
    stage: "generation",
    retryable: false,
    code: undefined,
    retryAfterSeconds: undefined,
    elapsedMs: undefined,
    timeoutSeconds: undefined,
  });
});

test("point-cloud access failures use a specific non-retryable message", async () => {
  const response = new Response(null, { status: 403 });

  assert.deepEqual(await pointCloudProblemFromResponse(response), {
    title: "Administrator access required",
    detail: "Administrator access is required to load the mower point cloud.",
    status: 403,
    code: "point_cloud_admin_required",
    stage: "authorization",
    retryable: false,
  });
});

test("point-cloud guidance distinguishes access, retry, and report actions", () => {
  assert.match(
    pointCloudProblemHint({
      title: "Administrator access required",
      detail: "Administrator access is required.",
      status: 403,
      retryable: false,
    }),
    /administrator account/,
  );
  assert.match(
    pointCloudProblemHint({
      title: "Temporarily unavailable",
      detail: "Try later.",
      retryable: true,
    }),
    /Try again/,
  );
  assert.match(
    pointCloudProblemHint({
      title: "Unsupported",
      detail: "This model is not supported.",
      retryable: false,
    }),
    /diagnostic reference/,
  );
});
