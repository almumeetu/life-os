import { NextResponse } from "next/server";
import { parseLocale, SUPPORTED_LOCALES } from "@/lib/i18n";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
    }
  }

  let requestedLocale: unknown;
  try {
    requestedLocale = (await request.json()).locale;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof requestedLocale !== "string" || !SUPPORTED_LOCALES.includes(requestedLocale as (typeof SUPPORTED_LOCALES)[number])) {
    return NextResponse.json({ error: "Unsupported language." }, { status: 400 });
  }

  const locale = parseLocale(requestedLocale);
  const response = NextResponse.json({ locale });
  response.cookies.set("life-os-locale", locale, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
