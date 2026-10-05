"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";

type Method = "email" | "phone" | "apple";
type NoticeKey =
  | "missingConfig"
  | "errorGeneric"
  | "callbackError"
  | "checkEmail"
  | "codeSent"
  | "passwordTooShort";

const methods: Method[] = ["email", "phone", "apple"];

function callbackUrl(locale: string) {
  const path =
    locale === routing.defaultLocale
      ? "/auth/callback"
      : `/${locale}/auth/callback`;
  const next = locale === routing.defaultLocale ? "/" : `/${locale}`;
  const url = new URL(path, window.location.origin);
  url.searchParams.set("next", next);
  return url.toString();
}

function identityOf(user: {
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const displayName = user.user_metadata?.display_name;
  if (typeof displayName === "string" && displayName.length > 0) {
    return displayName;
  }
  return user.email || user.phone || "";
}

export function AuthForm({
  initialError,
}: {
  initialError: "callback" | "config" | null;
}) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const router = useRouter();
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<NoticeKey | null>(
    initialError === "callback"
      ? "callbackError"
      : initialError === "config"
        ? "missingConfig"
        : null,
  );
  const [signedInAs, setSignedInAs] = useState<string | null>(null);

  async function clientOrNotice() {
    const supabase = createClient();
    if (!supabase) {
      setNotice("missingConfig");
      return null;
    }
    return supabase;
  }

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const supabase = createClient();
      if (!supabase) {
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!active) {
        return;
      }
      const user = data.session?.user;
      setSignedInAs(user ? identityOf(user) : "");
    }

    void loadSession();
    return () => {
      active = false;
    };
  }, []);

  async function onEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent =
      submitter instanceof HTMLButtonElement ? submitter.value : "sign-in";
    setNotice(null);

    if (intent === "sign-up" && password.length < 6) {
      setNotice("passwordTooShort");
      return;
    }

    const supabase = await clientOrNotice();
    if (!supabase) {
      return;
    }

    setPending(true);
    if (intent === "sign-up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: displayName ? { display_name: displayName } : undefined,
          emailRedirectTo: callbackUrl(locale),
        },
      });
      setPending(false);
      if (error) {
        setNotice("errorGeneric");
        return;
      }
      if (!data.session) {
        setNotice("checkEmail");
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setPending(false);
      if (error) {
        setNotice("errorGeneric");
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  async function onSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    const supabase = await clientOrNotice();
    if (!supabase) {
      return;
    }
    setPending(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: "sms",
        data: displayName ? { display_name: displayName } : undefined,
      },
    });
    setPending(false);
    if (error) {
      setNotice("errorGeneric");
      return;
    }
    setCodeSent(true);
    setNotice("codeSent");
  }

  async function onVerifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    const supabase = await clientOrNotice();
    if (!supabase) {
      return;
    }
    setPending(true);
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    });
    setPending(false);
    if (error) {
      setNotice("errorGeneric");
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function onApple() {
    setNotice(null);
    const supabase = await clientOrNotice();
    if (!supabase) {
      return;
    }
    setPending(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: callbackUrl(locale) },
    });
    if (error) {
      setPending(false);
      setNotice("errorGeneric");
    }
  }

  async function onSignOut() {
    const supabase = await clientOrNotice();
    if (!supabase) {
      return;
    }
    setPending(true);
    await supabase.auth.signOut();
    setSignedInAs(null);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="mt-8 grid gap-6">
      {signedInAs ? (
        <div className="grid gap-3 rounded-xl bg-muted px-4 py-3">
          <p>{t("signedInAs", { identity: signedInAs })}</p>
          <Button type="button" variant="outline" disabled={pending} onClick={onSignOut}>
            {t("signOut")}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("methodLabel")}>
        {methods.map((item) => {
          const active = item === method;
          return (
            <Button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              variant={active ? "default" : "outline"}
              onClick={() => {
                setMethod(item);
                setNotice(null);
              }}
            >
              {t(item)}
            </Button>
          );
        })}
      </div>

      {method === "email" ? (
        <form className="grid gap-4" onSubmit={onEmail}>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("displayNameLabel")}
            <Input
              name="displayName"
              autoComplete="nickname"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("emailLabel")}
            <Input
              name="email"
              type="email"
              autoComplete="email"
              required
              dir="ltr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("passwordLabel")}
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              dir="ltr"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" name="intent" value="sign-in" disabled={pending}>
              {t("signIn")}
            </Button>
            <Button
              type="submit"
              name="intent"
              value="sign-up"
              variant="outline"
              disabled={pending}
            >
              {t("signUp")}
            </Button>
          </div>
        </form>
      ) : null}

      {method === "phone" ? (
        <form
          className="grid gap-4"
          onSubmit={codeSent ? onVerifyCode : onSendCode}
        >
          <label className="grid gap-1.5 text-sm font-medium">
            {t("displayNameLabel")}
            <Input
              name="displayName"
              autoComplete="nickname"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            {t("phoneLabel")}
            <Input
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              dir="ltr"
              placeholder="+972501234567"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <span className="font-normal text-muted-foreground">{t("phoneHint")}</span>
          </label>
          {codeSent ? (
            <label className="grid gap-1.5 text-sm font-medium">
              {t("codeLabel")}
              <Input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                dir="ltr"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
          ) : null}
          <Button type="submit" disabled={pending}>
            {codeSent ? t("verifyCode") : t("sendCode")}
          </Button>
        </form>
      ) : null}

      {method === "apple" ? (
        <Button type="button" disabled={pending} onClick={onApple}>
          {t("continueWithApple")}
        </Button>
      ) : null}

      {notice ? (
        <p role="status" className="text-sm text-muted-foreground">
          {t(notice)}
        </p>
      ) : null}
    </div>
  );
}
