import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:4000";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  const url = new URL(pathname + search, BACKEND_URL);
  return NextResponse.rewrite(url, { request });
}

export const config = {
  matcher: ["/api/:path*"],
};
