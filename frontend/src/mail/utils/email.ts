const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmailList(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function findInvalidEmails(value?: string | null): string[] {
  return parseEmailList(value).filter((email) => !EMAIL_REGEX.test(email));
}
