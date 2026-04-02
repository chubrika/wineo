import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:4000")
  .trim()
  .replace(/\/$/, "");

/**
 * Frontend entry point for Google OAuth.
 *
 * This route keeps the UI simple (`href="/auth/google"`) while redirecting the browser
 * to the environment-specific backend OAuth start URL:
 * - Local: http://localhost:4000/api/auth/google
 * - Production: https://api.wineo.ge/api/auth/google
 */
export function GET(req: NextRequest) {
  const link = req.nextUrl.searchParams.get("link");
  const url = new URL(`${BACKEND_URL}/api/auth/google`);
  if (link === "1") url.searchParams.set("link", "1");
  return NextResponse.redirect(url, 302);
}
