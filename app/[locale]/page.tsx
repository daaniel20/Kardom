import { getLocale, getTranslations } from "next-intl/server";
import { LanguageToggle } from "@/components/language-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { directionFor } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const locale = await getLocale();
  const direction = directionFor(locale);
  const t = await getTranslations("Home");

  return (
    <main
      data-locale={locale}
      data-direction={direction}
      className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-6 py-16"
    >
      <section className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("intro")}</p>
        <dl className="mt-6 grid gap-3 text-base">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">{t("localeLabel")}</dt>
            <dd className="font-medium">{locale}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">{t("directionLabel")}</dt>
            <dd className="font-medium">{direction}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <LanguageToggle />
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-10 px-4",
            )}
          >
            {t("signIn")}
          </Link>
        </div>
      </section>
    </main>
  );
}
