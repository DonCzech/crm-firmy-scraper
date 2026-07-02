export function coerceTrimmedString(value: unknown): string {
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string' && item.trim().length > 0);
    return typeof first === 'string' ? first.trim() : '';
  }
  return typeof value === 'string' ? value.trim() : '';
}
