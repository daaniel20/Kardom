import { createClient } from "@/lib/supabase/server";

type SessionUser = {
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
};

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function identityFromSession(user: SessionUser) {
  const metadata = user.user_metadata ?? {};
  return (
    textValue(metadata.display_name) ||
    textValue(metadata.full_name) ||
    textValue(user.email) ||
    textValue(user.phone)
  );
}

export async function getSessionIdentity(): Promise<string | null> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return null;
    }

    let identity = identityFromSession(data.user);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("auth_id", data.user.id)
        .maybeSingle();
      const displayName = textValue(profile?.display_name);
      if (displayName) {
        identity = displayName;
      }
    } catch {
      // The session identity is enough when the profile row cannot be read.
    }

    return identity;
  } catch {
    return null;
  }
}
