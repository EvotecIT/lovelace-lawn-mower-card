export const POINT_CLOUD_API_PREFIX =
  "/api/dreame_lawn_mower/point-cloud/";

export type PointCloudHassEntity = {
  attributes?: Record<string, unknown>;
};

export type SignedPathResponse = {
  path: string;
};

export type PointCloudProblem = {
  title: string;
  detail: string;
  status?: number;
  code?: string;
  stage?: string;
  retryable: boolean;
  retryAfterSeconds?: number;
  elapsedMs?: number;
  timeoutSeconds?: number;
};

type PointCloudProblemResponse = Pick<Response, "status" | "headers" | "json">;

const SAFE_PROBLEM_TOKEN = /^[a-z][a-z0-9_]{0,63}$/;

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

export async function pointCloudProblemFromResponse(
  response: PointCloudProblemResponse,
): Promise<PointCloudProblem> {
  if (response.status === 401 || response.status === 403) {
    return {
      title: "Administrator access required",
      detail: "Administrator access is required to load the mower point cloud.",
      status: response.status,
      code: "point_cloud_admin_required",
      stage: "authorization",
      retryable: false,
    };
  }

  const fallback: PointCloudProblem = {
    title: "3D map unavailable",
    detail: `The mower point cloud is unavailable (HTTP ${response.status}).`,
    status: response.status,
    retryable: response.status >= 500,
  };
  const contentType = response.headers.get("Content-Type")?.toLowerCase() || "";
  if (!contentType.includes("application/problem+json")) {
    return fallback;
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return fallback;
  }
  if (!isRecord(payload)) {
    return fallback;
  }

  const title = boundedSingleLine(payload.title, 120) || fallback.title;
  const detail = boundedSingleLine(payload.detail, 360) || fallback.detail;
  const code = safeProblemToken(payload.code);
  const stage = safeProblemToken(payload.stage);
  return {
    title,
    detail,
    status: response.status,
    code,
    stage,
    retryable:
      typeof payload.retryable === "boolean"
        ? payload.retryable
        : fallback.retryable,
    retryAfterSeconds: boundedNumber(payload.retry_after_seconds, 0, 3600),
    elapsedMs: boundedNumber(payload.elapsed_ms, 0, 3_600_000),
    timeoutSeconds: boundedNumber(payload.timeout_seconds, 0, 3600),
  };
}

export function pointCloudProblemHint(problem: PointCloudProblem): string {
  if (
    problem.code === "point_cloud_admin_required" ||
    problem.status === 401 ||
    problem.status === 403
  ) {
    return "Sign in with a Home Assistant administrator account, or ask an administrator to open this 3D map.";
  }
  if (problem.retryable) {
    return "Try again after a few seconds. If this repeats, download the integration diagnostics before restarting Home Assistant.";
  }
  return "Download the integration diagnostics and include this diagnostic reference in the issue report.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedSingleLine(value: unknown, maximumLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.replace(/[\r\n\t]+/g, " ").trim();
  if (!normalized || normalized.length > maximumLength) {
    return undefined;
  }
  return normalized;
}

function safeProblemToken(value: unknown): string | undefined {
  return typeof value === "string" && SAFE_PROBLEM_TOKEN.test(value)
    ? value
    : undefined;
}

function boundedNumber(
  value: unknown,
  minimum: number,
  maximum: number,
): number | undefined {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
    ? value
    : undefined;
}
