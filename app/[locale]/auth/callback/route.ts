import { NextResponse, type NextRequest } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

function loginPath(locale: string) {
  return locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
}

function safeNext(value: string | null, locale: string) {
  if (
    value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
  ) {
    return value;
  }

  return locale === routing.defaultLocale ? "/" : `/${locale}`;
}

function publicOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  if (process.env.NODE_ENV !== "development" && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}

function redirectTo(url: URL) {
  const response = NextResponse.redirect(url);
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  response.headers.set("Expires", "0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> },
) {
  const { locale: localeParam } = await context.params;
  const locale = hasLocale(routing.locales, localeParam)
    ? localeParam
    : routing.defaultLocale;
  const origin = publicOrigin(request);
  const loginUrl = new URL(loginPath(locale), origin);
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNext(request.nextUrl.searchParams.get("next"), locale);

  if (!code) {
    loginUrl.searchParams.set("error", "callback");
    return redirectTo(loginUrl);
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      loginUrl.searchParams.set("error", "config");
      return redirectTo(loginUrl);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectTo(new URL(next, origin));
    }
  } catch {
    loginUrl.searchParams.set("error", "callback");
    return redirectTo(loginUrl);
  }

  loginUrl.searchParams.set("error", "callback");
  return redirectTo(loginUrl);
}
