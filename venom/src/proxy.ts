import { NextRequest, NextResponse } from "next/server";

const PLATFORM_DOMAINS = new Set([
  "venom-saas.vercel.app",
  "localhost",
  "127.0.0.1",
]);

// Edge-compatible cookie name (must match @/lib/auth COOKIE_NAME)
const ADMIN_COOKIE_NAME = "astera_admin_token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host")?.split(":")[0] ?? "";

  // ── Custom domain routing ─────────────────────────────────────────────────
  if (!PLATFORM_DOMAINS.has(host) && !host.endsWith(".vercel.app")) {
    const isAsset =
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon") ||
      pathname.includes(".");

    if (!isAsset) {
      try {
        const bareHost = host.startsWith("www.") ? host.slice(4) : host;
        const lookupUrl = new URL("/api/domain-lookup", request.nextUrl.origin);
        lookupUrl.searchParams.set("domain", bareHost);

        const res = await fetch(lookupUrl.toString(), {
          headers: { "x-internal-token": process.env.INTERNAL_API_TOKEN ?? "" },
        });

        if (res.ok) {
          const { slug, www_redirect } = (await res.json()) as {
            slug?: string;
            www_redirect?: string;
          };
          if (slug) {
            const hasWww = host.startsWith("www.");
            const wantsWww = www_redirect === "redirect_to_www";
            const wantsNonWww = www_redirect === "redirect_to_non_www";

            if (wantsWww && !hasWww) {
              const redirectUrl = new URL(request.url);
              redirectUrl.host = `www.${host}`;
              return NextResponse.redirect(redirectUrl, 301);
            }
            if (wantsNonWww && hasWww) {
              const redirectUrl = new URL(request.url);
              redirectUrl.host = bareHost;
              return NextResponse.redirect(redirectUrl, 301);
            }

            const rewriteUrl = request.nextUrl.clone();
            rewriteUrl.pathname = `/demo/${slug}${pathname === "/" ? "" : pathname}`;
            return NextResponse.rewrite(rewriteUrl);
          }
        }
      } catch {
        // Fall through to normal routing on lookup failure
      }
    }
  }

  // ── Admin route protection ────────────────────────────────────────────────
  // Note: cookie presence check only — actual JWT verification happens in API routes
  const hasCookie = !!request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (hasCookie && (pathname === "/admin/login" || pathname === "/admin/setup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
