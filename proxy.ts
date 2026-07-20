// Next 16 proxy (the renamed middleware). One job: forward the request's
// pathname as a request header so the server-rendered root layout can put the
// correct data-branch on <html> at first paint — the branch colour wash then
// exists before hydration and entirely without JS (crawlers, reader modes).
// The site is already dynamic per-request (the layout reads the locale
// cookie), so reading a header there adds no rendering cost.
// components/BranchReveal.tsx still owns everything after hydration (the
// tab-click colour flood, client-side navigations).
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NK_PATHNAME_HEADER } from "@/lib/branches";

export function proxy(request: NextRequest) {
  // Clone the incoming headers and add the pathname; passing them via
  // `request:` forwards them upstream to the render (not to the client).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NK_PATHNAME_HEADER, request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Page requests only — skip Next internals + well-known static files, so the
  // proxy isn't invoked for every asset.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
