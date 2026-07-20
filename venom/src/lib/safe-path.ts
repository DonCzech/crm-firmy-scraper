import path from "path";

const SAFE_KEY = /^[a-z0-9][a-z0-9-]{0,79}$/;

export function assertSafeKey(value: string, label = "key"): string {
  if (!SAFE_KEY.test(value)) throw new Error(`Invalid ${label}`);
  return value;
}

export function resolveWithin(root: string, ...segments: string[]): string {
  const canonicalRoot = path.resolve(/* turbopackIgnore: true */ root);
  const result = path.resolve(/* turbopackIgnore: true */ canonicalRoot, ...segments);
  if (result !== canonicalRoot && !result.startsWith(`${canonicalRoot}${path.sep}`)) {
    throw new Error("Path escapes the allowed root");
  }
  return result;
}
