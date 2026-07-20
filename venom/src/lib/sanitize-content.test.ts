import { describe, expect, it } from "vitest";
import { sanitizeRichContent, sanitizeRichHtml, stripHtml } from "./sanitize-content";

describe("rich content sanitizer", () => {
  it("removes executable HTML and unsafe protocols", () => {
    const dirty = '<p onclick="alert(1)">Hello<script>alert(1)</script><a href="javascript:alert(1)">x</a></p>';
    const clean = sanitizeRichHtml(dirty);
    expect(clean).toBe("<p>Hello<a>x</a></p>");
  });

  it("adds rel protection to links opening a new tab", () => {
    expect(sanitizeRichHtml('<a href="https://example.com" target="_blank">x</a>'))
      .toContain('rel="noopener noreferrer"');
  });

  it("recursively sanitizes nested editor payloads", () => {
    expect(sanitizeRichContent({ blocks: [{ content: "<img src=x onerror=alert(1)><strong>ok</strong>" }] }))
      .toEqual({ blocks: [{ content: "<strong>ok</strong>" }] });
  });

  it("strips markup from plain fields", () => {
    expect(stripHtml("<b>Title</b><script>x</script>")).toBe("Title");
  });
});
