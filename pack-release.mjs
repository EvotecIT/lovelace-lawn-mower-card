import { mkdir, rm, copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const releaseDir = resolve(root, "release");
const files = ["lawn-mower-card.js", "README.md", "hacs.json", "LICENSE"];

await rm(releaseDir, { recursive: true, force: true });
await mkdir(releaseDir, { recursive: true });

for (const file of files) {
  await copyFile(resolve(root, file), resolve(releaseDir, file));
}

console.log(`Packaged release files into ${releaseDir}`);
