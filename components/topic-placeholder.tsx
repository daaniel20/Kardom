import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export async function TopicPlaceholder({
  kind,
  id,
}: {
  kind: "month" | "event";
  id: string;
}) {
  const t = await getTranslations("Topic");
  const current = await getTranslations("Globe");
  const hebrew = await getTranslations({ locale: "he", namespace: "Globe" });
  const english = await getTranslations({ locale: "en", namespace: "Globe" });
  const group = kind === "month" ? "months" : "events";
  const name = current(`${group}.${id}`);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-xl flex-col justify-center px-6 py-16">
      <article className="rounded-2xl border border-white/70 bg-white/70 p-8 text-card-foreground shadow-[0_16px_40px_rgb(60_77_94/0.08)] backdrop-blur-xl">
        <p className="text-sm font-medium text-muted-foreground">{t(kind)}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{name}</h1>
        <dl className="mt-6 grid gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">{t("hebrewName")}</dt>
            <dd className="mt-1 text-lg font-medium" lang="he" dir="rtl">
              {hebrew(`${group}.${id}`)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("englishName")}</dt>
            <dd className="mt-1 text-lg font-medium" lang="en" dir="ltr">
              {english(`${group}.${id}`)}
            </dd>
          </div>
        </dl>
        <div className="mt-8">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 px-4")}
          >
            {t("back")}
          </Link>
        </div>
      </article>
    </main>
  );
}
