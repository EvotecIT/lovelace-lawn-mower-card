export const POINT_CLOUD_API_PREFIX =
  "/api/dreame_lawn_mower/point-cloud/";

export type PointCloudHassEntity = {
  attributes?: Record<string, unknown>;
};

export type SignedPathResponse = {
  path: string;
};

export function normalizePointCloudApiPath(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const path = value.trim();
  if (!path.startsWith(POINT_CLOUD_API_PREFIX) || path.includes("?")) {
    return undefined;
  }

  const segments = path.slice(POINT_CLOUD_API_PREFIX.length).split("/");
  if (segments.length !== 2) {
    return undefined;
  }
  const [entryId, rawMapIndex] = segments;
  if (!/^[a-zA-Z0-9_-]+$/.test(entryId) || !/^\d{1,3}$/.test(rawMapIndex)) {
    return undefined;
  }
  const mapIndex = Number(rawMapIndex);
  if (!Number.isInteger(mapIndex) || mapIndex > 255) {
    return undefined;
  }
  return `${POINT_CLOUD_API_PREFIX}${entryId}/${mapIndex}`;
}

export function pointCloudPathFromEntity(
  entity: PointCloudHassEntity | undefined,
): string | undefined {
  return normalizePointCloudApiPath(
    entity?.attributes?.point_cloud_api_path,
  );
}

export function pointCloudRequestPath(
  path: string,
  refresh: boolean,
): string {
  return refresh ? `${path}?refresh=1` : path;
}

export function signedPathFromResponse(
  response: unknown,
): string | undefined {
  if (
    typeof response !== "object" ||
    response === null ||
    !("path" in response)
  ) {
    return undefined;
  }
  const path = (response as SignedPathResponse).path;
  return typeof path === "string" && path.startsWith("/") ? path : undefined;
}
