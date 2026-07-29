import { POINT_CLOUD_MODULE_GZIP_BASE64 } from "./point-cloud-assets";

let pointCloudModule: Promise<unknown> | undefined;

async function decodeModule(): Promise<string> {
  if (typeof DecompressionStream !== "function") {
    throw new Error("This browser does not support gzip module decoding.");
  }
  const binary = atob(POINT_CLOUD_MODULE_GZIP_BASE64);
  const compressed = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    compressed[index] = binary.charCodeAt(index);
  }
  const stream = new Blob([compressed])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return await new Response(stream).text();
}

export function loadPointCloudModule(): Promise<unknown> {
  if (pointCloudModule) {
    return pointCloudModule;
  }
  const loading = (async () => {
    const source = await decodeModule();
    const url = URL.createObjectURL(
      new Blob([source], { type: "text/javascript" }),
    );
    try {
      return await import(/* @vite-ignore */ url);
    } finally {
      URL.revokeObjectURL(url);
    }
  })();
  pointCloudModule = loading.catch((error) => {
    pointCloudModule = undefined;
    throw error;
  });
  return pointCloudModule;
}
