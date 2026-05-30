export function cssImageUrl(url: string): string {
  return `url("${url.replace(/"/g, '\\"')}")`;
}
