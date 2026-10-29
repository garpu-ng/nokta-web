// ?lang=en|de|tr|ja: sets the locale cookie and redirects to the same URL
// without the parameter, so a shared link opens in that language and the
// choice sticks (same cookie as the language toggle). Other params are kept;
// an unknown value is ignored and the request passes through unchanged.
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale } from "@/lib/locales";

export function proxy(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");
  if (!isLocale(lang)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.searchParams.delete("lang");
  const res = NextResponse.redirect(url, 307);
  res.cookies.set(LOCALE_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: [{ source: "/:path*", has: [{ type: "query", key: "lang" }] }],
};
