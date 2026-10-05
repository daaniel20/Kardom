import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { copySessionCookies, refreshSupabaseSession } from "./lib/supabase/session";

const handleI18nRouting = createMiddleware(routing);

/**
 * Next rewrites the unprefixed default locale to an internal localhost URL.
 * When the browser host is 127.0.0.1, that rewrite is fetched again and
 * next-intl redirects it back to "/", which loops. Render that internal
 * request instead of redirecting.
 */
function isInternalLocaleRewrite(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const forwardedHost = request.headers.get("x-forwarded-host") ?? "";
  if (!host.startsWith("localhost") || !forwardedHost || forwardedHost === host) {
    return false;
  }

  const { pathname } = request.nextUrl;
  return pathname === "/he" || pathname.startsWith("/he/");
}

export default async function proxy(request: NextRequest) {
  if (isInternalLocaleRewrite(request)) {
    return NextResponse.next();
  }

  let sessionResponse = null;

  try {
    sessionResponse = await refreshSupabaseSession(request);
  } catch {
    sessionResponse = null;
  }

  const response = handleI18nRouting(request);
  const cookie = request.headers.get("cookie");
  if (cookie) {
    const override = response.headers.get("x-middleware-override-headers");
    const keys = new Set(
      override
        ? override
            .split(",")
            .map((key) => key.trim())
            .filter(Boolean)
        : [],
    );
    keys.add("cookie");
    response.headers.set("x-middleware-request-cookie", cookie);
    response.headers.set("x-middleware-override-headers", [...keys].join(","));
  }

  if (sessionResponse) {
    copySessionCookies(sessionResponse, response);
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
