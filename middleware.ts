import { NextRequest, NextResponse } from "next/server";

/**
 * API proxy is handled by next.config.ts rewrites (/api/* → BACKEND_URL/api/*).
 * This middleware only returns 503 on Vercel when BACKEND_URL is missing or points to localhost,
 * so the app fails clearly instead of 404.
 */
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:4000").trim().replace(/\/$/, "");

function isPrivateOrLocalhost(url: URL): boolean {
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname.endsWith(".local")) return true;
  const parts = hostname.split(".").map((s) => parseInt(s, 10));
  if (parts.length === 4 && parts.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  const url = new URL(pathname + request.nextUrl.search, BACKEND_URL);
  if (process.env.VERCEL === "1" && isPrivateOrLocalhost(url)) {
    return NextResponse.json(
      {
        error: "API proxy misconfiguration",
        message:
          "Set BACKEND_URL in Vercel to your public API URL (e.g. https://your-api.onrender.com).",
      },
      { status: 503 }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
