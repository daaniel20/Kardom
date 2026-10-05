import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

const CACHE_HEADERS = ["cache-control", "expires", "pragma"] as const;

function applyCookieOptions(
  options: {
    domain?: string;
    path?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    priority?: "low" | "medium" | "high";
    sameSite?: boolean | "lax" | "strict" | "none";
    secure?: boolean;
    partitioned?: boolean;
  },
) {
  return {
    domain: options.domain,
    path: options.path,
    expires: options.expires,
    httpOnly: options.httpOnly,
    maxAge: options.maxAge,
    priority: options.priority,
    sameSite: options.sameSite,
    secure: options.secure,
    partitioned: options.partitioned,
  };
}

/**
 * Refresh the Supabase auth cookie when the public env is present.
 * Missing credentials are a no-op so the Phase 1 home page still renders.
 * Returns the response that carries refreshed cookies, or null when nothing
 * was written.
 */
export async function refreshSupabaseSession(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  let supabaseResponse = NextResponse.next({ request });
  let wroteCookies = false;

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, applyCookieOptions(options));
        });
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
        wroteCookies = true;
      },
    },
  });

  await supabase.auth.getClaims();

  return wroteCookies ? supabaseResponse : null;
}

export function copySessionCookies(
  sessionResponse: NextResponse,
  response: NextResponse,
) {
  sessionResponse.headers.getSetCookie().forEach((cookie) => {
    response.headers.append("set-cookie", cookie);
  });

  for (const header of CACHE_HEADERS) {
    const value = sessionResponse.headers.get(header);
    if (value) {
      response.headers.set(header, value);
    }
  }
}
