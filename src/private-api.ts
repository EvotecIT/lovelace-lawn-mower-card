import type { HomeAssistant } from "./card-config";
import { signedPathMatches } from "./mowing-map-logic.ts";
import { signedPathFromResponse } from "./point-cloud-logic.ts";

/** Stop waiting on HA calls and browser decoding when their view leaves. */
export async function abortable<T>(pending: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  let cancel!: () => void;
  const aborted = new Promise<never>((_resolve, reject) => {
    cancel = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", cancel, { once: true });
  });
  try { return await Promise.race([pending, aborted]); }
  finally { signal.removeEventListener("abort", cancel); }
}

/** Fetch only the exact signed local route; never expose its credential in DOM. */
export async function fetchPrivateApi(hass: HomeAssistant, path: string, signal: AbortSignal): Promise<Response> {
  const signed = signedPathFromResponse(await abortable(hass.callWS<unknown>({
    type: "auth/sign_path", path, expires: 60,
  }), signal));
  signal.throwIfAborted();
  if (!signed || !signedPathMatches(path, signed)) throw new Error("Invalid signed path");
  const response = await fetch(hass.hassUrl(signed), {
    credentials: "same-origin", signal, cache: "no-store",
  });
  if (!response.ok) throw new Error(`Private request failed (${response.status})`);
  return response;
}
