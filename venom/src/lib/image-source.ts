export function shouldSkipNextImageOptimization(src?: string | null): boolean {
  return Boolean(
    src?.startsWith("/api/demo-placeholder") ||
    src?.startsWith("data:")
  );
}
