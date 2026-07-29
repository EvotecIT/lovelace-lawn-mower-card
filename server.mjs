import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import http from "node:http";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const pointCloudSizes = [120_000, 500_000, 2_000_000];
const demoPointClouds = new Map();

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pcd": "application/octet-stream",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative =
    decoded === "/"
        ? "/demo/index.html"
        : decoded;
  const fullPath = normalize(join(root, relative));
  return fullPath.startsWith(root) ? fullPath : null;
}

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || "").split("?")[0]);
  const pointCloudMatch = requestPath.match(
    /^\/api\/dreame_lawn_mower\/point-cloud\/demo-entry\/([0-2])$/,
  );
  if (pointCloudMatch) {
    const index = Number(pointCloudMatch[1]);
    const pointCount = pointCloudSizes[index];
    let demoPointCloud = demoPointClouds.get(index);
    if (!demoPointCloud) {
      demoPointCloud = createDemoPointCloud(pointCount);
      demoPointClouds.set(index, demoPointCloud);
    }
    response.writeHead(200, {
      "content-type": "application/octet-stream",
      "content-length": demoPointCloud.byteLength,
      "cache-control": "private, max-age=300",
      etag: `"demo-point-cloud-${pointCount}"`,
    });
    response.end(demoPointCloud);
    return;
  }
  const path = safePath(request.url || "/");
  if (!path || !existsSync(path) || statSync(path).isDirectory()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const contentType = contentTypes[extname(path)] || "application/octet-stream";
  response.writeHead(200, { "content-type": contentType });
  createReadStream(path).pipe(response);
});

function createDemoPointCloud(pointCount) {
  const header = Buffer.from(
    [
      "# Synthetic performance fixture; contains no mower or garden data.",
      "VERSION 0.7",
      "FIELDS x y z rgb",
      "SIZE 4 4 4 4",
      "TYPE F F F U",
      "COUNT 1 1 1 1",
      `WIDTH ${pointCount}`,
      "HEIGHT 1",
      "VIEWPOINT 0 0 0 1 0 0 0",
      `POINTS ${pointCount}`,
      "DATA binary",
      "",
    ].join("\n"),
  );
  const payload = Buffer.allocUnsafe(pointCount * 16);
  for (let index = 0; index < pointCount; index += 1) {
    const angle = index * 0.043;
    const radius = 2 + (index % 900) / 45;
    const offset = index * 16;
    payload.writeFloatLE(Math.cos(angle) * radius, offset);
    payload.writeFloatLE(Math.sin(angle) * radius, offset + 4);
    payload.writeFloatLE(
      Math.sin(angle * 0.27) * 0.8 + (index % 37) / 100,
      offset + 8,
    );
    const green = 100 + (index % 120);
    const red = 45 + (index % 55);
    const blue = 35 + (index % 45);
    payload.writeUInt32LE((red << 16) | (green << 8) | blue, offset + 12);
  }
  return Buffer.concat([header, payload]);
}

server.listen(port, () => {
  console.log(`Lawn mower card preview available at http://localhost:${port}/`);
});
