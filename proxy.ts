import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  stripLocalePrefix,
  type Locale,
} from "@/lib/locales";

// The public URL never carries a language. nk_lang picks one of the four
// prerendered trees (`/de/arbeiten`, `/en/arbeiten`, …) and this proxy rewrites
// the request onto it, so the HTML can be served as a static file. A document
// request that already has a locale prefix is sent back to the public URL;
// flight requests are left alone so a client navigation can still read the tree.

const PUBLIC_FILES = new Set([
  "/opengraph-image",
  "/twitter-image",
  "/sitemap.xml",
  "/robots.txt",
  "/icon.png",
  "/apple-icon.png",
  "/favicon.ico",
]);

function normalize(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function localeFromCookie(request: NextRequest): Locale {
  const value = request.cookies.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const pathname = normalize(request.nextUrl.pathname);

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    PUBLIC_FILES.has(pathname) ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    // RSC/prefetch fetches keep the internal path. A real navigation must not
    // grow a language prefix in the address bar.
    const accept = request.headers.get("accept") ?? "";
    if (!accept.includes("text/x-component")) {
      const url = request.nextUrl.clone();
      url.pathname = stripLocalePrefix(pathname);
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const locale = localeFromCookie(request);
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
