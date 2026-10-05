import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";
import { LanguageToggle } from "@/components/language-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  const t = await getTranslations("Auth");
  return {
    title: t("title"),
    description: t("intro"),
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const t = await getTranslations("Auth");
  const { error } = await searchParams;
  const initialError =
    error === "callback" || error === "config" ? error : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-6 py-16">
      <section className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("intro")}</p>
        <AuthForm initialError={initialError} />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <LanguageToggle />
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-10 px-4",
            )}
          >
            {t("backHome")}
          </Link>
        </div>
      </section>
    </main>
  );
}
