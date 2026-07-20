import path from "path";
import { describe, expect, it } from "vitest";
import { assertSafeKey, resolveWithin } from "./safe-path";

describe("safe paths", () => {
  it("accepts canonical template keys", () => {
    expect(assertSafeKey("barber-01")).toBe("barber-01");
  });

  it.each(["../secret", "/absolute", "two/slashes", "x%2f..", "", ".hidden"])(
    "rejects unsafe key %s",
    (key) => expect(() => assertSafeKey(key)).toThrow(),
  );

  it("keeps resolved files inside the root", () => {
    const root = path.resolve("/tmp/public");
    expect(resolveWithin(root, "templates", "a.webp")).toBe(path.join(root, "templates", "a.webp"));
    expect(() => resolveWithin(root, "..", "secret")).toThrow();
  });
});
