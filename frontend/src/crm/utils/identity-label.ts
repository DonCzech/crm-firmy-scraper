export function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function isOpaqueIdentifier(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;
  if (isUuidLike(normalized)) return true;
  if (/^[0-9a-f]{16,}$/i.test(normalized)) return true;
  if (/^[0-9A-HJKMNP-TV-Z]{26}$/.test(normalized)) return true;
  if (!/\s/.test(normalized) && /^[A-Za-z0-9_-]{20,}$/.test(normalized)) return true;
  return false;
}

export function sanitizeHumanLabel(value: string | undefined, fallback = 'Neznámý uživatel'): string {
  const normalized = (value || '').trim();
  if (!normalized) return fallback;
  return isOpaqueIdentifier(normalized) ? fallback : normalized;
}
