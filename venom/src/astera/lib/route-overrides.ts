import type { Lang } from "./i18n";
import { localizeHref } from "./i18n";
import type { RouteRedirect } from "./content-types";

const INTERNAL_HOSTS = new Set(["asteralight.cz", "www.asteralight.cz", "localhost", "127.0.0.1"]);

function routeId(prefix = "route") {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function cleanPath(pathname: string) {
  const path = pathname.split(/[?#]/)[0]?.trim() || "";
  if (!path) return "";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/g, "") : withSlash;
}

export function normalizeRoutePath(href: string | undefined, lang: Lang): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  if (/^(mailto|tel|sms|javascript):/i.test(trimmed)) return null;

  let localized = localizeHref(trimmed, lang);
  if (!localized.startsWith("/") && !/^https?:\/\//i.test(localized)) {
    localized = localizeHref(`/${localized}`, lang);
  }

  if (localized.startsWith("/")) return cleanPath(localized);

  try {
    const url = new URL(localized);
    const host = url.hostname.replace(/^www\./, "");
    if (!INTERNAL_HOSTS.has(host)) return null;
    return cleanPath(url.pathname);
  } catch {
    return null;
  }
}

function samePath(a: string | null | undefined, b: string | null | undefined) {
  return Boolean(a && b && cleanPath(a) === cleanPath(b));
}

function isReservedPath(path: string) {
  const first = cleanPath(path).split("/").filter(Boolean)[0] || "";
  return ["api", "admin", "_next", "uploads"].includes(first);
}

export function resolveRouteRedirect(redirects: RouteRedirect[] | undefined, path: string) {
  const requested = cleanPath(path);
  const match = (redirects || []).find(item => samePath(item.from, requested));
  if (!match || samePath(match.from, match.to)) return null;
  return cleanPath(match.to);
}

export function resolveRouteAliasTarget(redirects: RouteRedirect[] | undefined, path: string) {
  const requested = cleanPath(path);
  const match = (redirects || []).find(item => samePath(item.to, requested) && item.target);
  if (!match?.target || samePath(match.target, requested)) return null;
  return cleanPath(match.target);
}

export function stripRouteLang(path: string) {
  const parts = cleanPath(path).split("/").filter(Boolean);
  if (parts[0] === "cs" || parts[0] === "en" || parts[0] === "ua") parts.shift();
  return `/${parts.join("/")}`;
}

export function slugFromRoutePath(path: string) {
  return stripRouteLang(path).replace(/^\/+/, "").split("/")[0] || "";
}

export function withRouteChange(
  redirects: RouteRedirect[] | undefined,
  fromHref: string | undefined,
  toHref: string | undefined,
  lang: Lang,
) {
  const from = normalizeRoutePath(fromHref, lang);
  const to = normalizeRoutePath(toHref, lang);
  const current = redirects || [];

  if (!from || !to || samePath(from, to) || isReservedPath(from) || isReservedPath(to)) {
    return current;
  }

  const existingTarget = resolveRouteAliasTarget(current, from);
  const target = existingTarget || from;
  const now = new Date().toISOString();

  const rewritten = current
    .map(item => samePath(item.to, from)
      ? { ...item, to, target: item.target || target }
      : item
    )
    .filter(item => !samePath(item.from, item.to) && !samePath(item.from, from));

  const next: RouteRedirect = {
    id: routeId(),
    from,
    to,
    target,
    createdAt: now,
  };

  return [next, ...rewritten].slice(0, 200);
}
