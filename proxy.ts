import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { copySessionCookies, refreshSupabaseSession } from "./lib/supabase/session";

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  let sessionResponse = null;

  try {
    sessionResponse = await refreshSupabaseSession(request);
  } catch {
    sessionResponse = null;
  }

  const response = handleI18nRouting(request);

  if (sessionResponse) {
    copySessionCookies(sessionResponse, response);
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
