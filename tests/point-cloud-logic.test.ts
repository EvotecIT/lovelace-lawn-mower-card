import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizePointCloudApiPath,
  pointCloudPathFromEntity,
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
