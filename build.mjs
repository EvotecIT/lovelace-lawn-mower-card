import esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const context = await esbuild.context({
  entryPoints: ["src/lawn-mower-card.ts"],
  outfile: "lawn-mower-card.js",
  bundle: true,
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
}

