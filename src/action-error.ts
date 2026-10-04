/** Read the bounded message from native errors and HA WebSocket rejections. */
export function actionErrorDetail(error: unknown): string | undefined {
  if (
    error === null ||
    typeof error !== "object" ||
    !("message" in error) ||
    typeof error.message !== "string"
  ) {
    return undefined;
  }
  const detail = error.message.replace(/[\r\n\t]+/g, " ").trim().slice(0, 240);
  return detail || undefined;
}
