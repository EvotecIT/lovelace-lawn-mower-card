import esbuild from "esbuild";
import { readFile, writeFile } from "node:fs/promises";

const watch = process.argv.includes("--watch");

const context = await esbuild.context({
  entryPoints: ["src/lawn-mower-card.ts"],
  outfile: "lawn-mower-card.js",
  bundle: true,
  loader: { ".jpg": "dataurl" },
  format: "esm",
  target: "es2021",
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  logLevel: "info",
});

if (watch) {
  await context.watch();
  console.log("Watching lawn-mower-card sources...");
} else {
  await context.rebuild();
  await context.dispose();
  const output = await readFile("lawn-mower-card.js", "utf8");
  await writeFile(
    "lawn-mower-card.js",
    output.replace(/[ \t]+$/gm, "").replace(/^ +\t/gm, "\t"),
    "utf8",
  );
}
