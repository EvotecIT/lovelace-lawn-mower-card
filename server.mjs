import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import http from "node:http";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = decoded === "/" ? "/demo/index.html" : decoded;
  const fullPath = normalize(join(root, relative));
  return fullPath.startsWith(root) ? fullPath : null;
}

const server = http.createServer((request, response) => {
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

server.listen(port, () => {
  console.log(`Lawn mower card preview available at http://localhost:${port}/`);
});

