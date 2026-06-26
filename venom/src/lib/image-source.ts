export function shouldSkipNextImageOptimization(src?: string | null): boolean {
  return Boolean(
    src?.startsWith("/api/demo-placeholder") ||
    src?.startsWith("data:") ||
    src?.startsWith("/images/template-previews/") ||
    src?.startsWith("/clones/") ||
    src?.startsWith("/uploads/")
  );
}
