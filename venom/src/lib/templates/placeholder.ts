export function placeholderImage(
  width: number,
  height: number,
  label = "Přidat obrázek"
): string {
  const safe = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const fontSize = Math.max(14, Math.min(28, Math.round(Math.min(width, height) / 14)));
  const plusSize = Math.round(Math.min(width, height) / 5);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice"><rect width="${width}" height="${height}" fill="#f0eeea"/><rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#c8c4be" stroke-width="2" stroke-dasharray="8 8"/><g fill="#7a766f"><circle cx="${width / 2}" cy="${height / 2 - fontSize * 1.6}" r="${plusSize / 2}" fill="#e6e2dc"/><rect x="${width / 2 - plusSize / 6}" y="${height / 2 - fontSize * 1.6 - plusSize / 3}" width="${plusSize / 3}" height="${(plusSize * 2) / 3}" fill="#7a766f"/><rect x="${width / 2 - plusSize / 3}" y="${height / 2 - fontSize * 1.6 - plusSize / 6}" width="${(plusSize * 2) / 3}" height="${plusSize / 3}" fill="#7a766f"/><text x="50%" y="${height / 2 + fontSize * 0.2}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="600">${safe}</text><text x="50%" y="${height / 2 + fontSize * 1.6}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(fontSize * 0.75)}" opacity="0.7">${width} × ${height} px</text></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
