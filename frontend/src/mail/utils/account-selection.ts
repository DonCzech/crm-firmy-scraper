const STORAGE_KEY = 'mail_selected_account_email';

export function getSelectedMailAccountEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

export function setSelectedMailAccountEmail(email: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (email && email.trim()) {
      window.localStorage.setItem(STORAGE_KEY, email.trim().toLowerCase());
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage failures
  }
  window.dispatchEvent(
    new CustomEvent('mailAccountSelected', {
      detail: { email: email?.trim().toLowerCase() || null },
    }),
  );
}
