import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

test("preview serves its own files and rejects escaped or malformed paths", { timeout: 15_000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), "mower-preview-"));
  const root = join(directory, "public");
  const sibling = join(directory, "public-private");
  const reservation = createServer();
  reservation.listen(0, "127.0.0.1");
  await once(reservation, "listening");
  const address = reservation.address();
  assert.ok(address && typeof address !== "string");
  const port = address.port;
  await new Promise<void>((resolve, reject) => reservation.close(error => error ? reject(error) : resolve()));
  let child: ReturnType<typeof spawn> | undefined;
  try {
    await mkdir(join(root, "demo"), { recursive: true });
    await mkdir(sibling);
    await writeFile(join(root, "demo", "index.html"), "preview fixture");
    await writeFile(join(sibling, "canary.txt"), "private fixture");
    child = spawn(process.execPath, [fileURLToPath(new URL("../server.mjs", import.meta.url))], {
      cwd: root,
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    assert.ok(child.stdout);
    await Promise.race([
      once(child.stdout, "data"),
      once(child, "exit").then(() => { throw new Error("Preview exited before listening"); }),
    ]);
    const base = `http://127.0.0.1:${port}`;
    const escaped = await fetch(`${base}/..%2fpublic-private/canary.txt`);
    assert.equal(escaped.status, 404);
    assert.notEqual(await escaped.text(), "private fixture");
    const malformed = await fetch(`${base}/%ZZ`);
    assert.equal(malformed.status, 400);
    const normal = await fetch(`${base}/`);
    assert.equal(normal.status, 200);
    assert.equal(await normal.text(), "preview fixture");
  } finally {
    if (child && child.exitCode === null) {
      const exited = once(child, "exit");
      child.kill();
      await exited;
    }
    await rm(directory, { recursive: true, force: true });
  }
});
