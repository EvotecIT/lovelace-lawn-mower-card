import esbuild from "esbuild";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const watch = process.argv.includes("--watch");

await rm("lawn-mower-chunks", { recursive: true, force: true });
await rm("point-cloud-worker.js", { force: true });

let pointCloudModuleBase64 = "";
let pointCloudWatchFiles = [];

const embeddedPointCloudPlugin = {
  name: "embedded-point-cloud",
  setup(build) {
    build.onStart(async () => {
      const worker = await esbuild.build({
        entryPoints: ["src/point-cloud-worker.ts"],
        bundle: true,
        write: false,
        format: "iife",
        target: "es2021",
        minify: true,
        metafile: true,
      });
      const workerSource = worker.outputFiles[0].text;
      const pointCloudAssetsPlugin = {
        name: "point-cloud-worker-source",
        setup(pointCloudBuild) {
          pointCloudBuild.onLoad(
            { filter: /point-cloud-assets\.ts$/ },
            () => ({
              contents:
                `export const POINT_CLOUD_WORKER_SOURCE=${JSON.stringify(workerSource)};` +
                `export const POINT_CLOUD_MODULE_GZIP_BASE64="";`,
              loader: "js",
            }),
          );
        },
      };
      const pointCloud = await esbuild.build({
        entryPoints: ["src/point-cloud-view.ts"],
        bundle: true,
        write: false,
        format: "esm",
        target: "es2021",
        minify: true,
        metafile: true,
        loader: { ".jpg": "dataurl" },
        plugins: [pointCloudAssetsPlugin],
      });
      pointCloudModuleBase64 = gzipSync(pointCloud.outputFiles[0].contents, {
        level: 9,
      }).toString("base64");
      pointCloudWatchFiles = [
        ...new Set(
          [
            ...Object.keys(worker.metafile.inputs),
            ...Object.keys(pointCloud.metafile.inputs),
          ].map((input) => resolve(input)),
        ),
      ];
    });
    build.onLoad({ filter: /point-cloud-assets\.ts$/ }, () => ({
      contents:
        `export const POINT_CLOUD_MODULE_GZIP_BASE64=${JSON.stringify(pointCloudModuleBase64)};` +
        `export const POINT_CLOUD_WORKER_SOURCE="";`,
      loader: "js",
      watchFiles: pointCloudWatchFiles,
    }));
  },
};

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
  plugins: [embeddedPointCloudPlugin],
});

if (watch) {
  await context.watch();
  console.log("Watching lawn-mower-card sources...");
} else {
  await context.rebuild();
  await context.dispose();
}
