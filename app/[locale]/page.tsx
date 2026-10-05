import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { DailyZmanim } from "@/components/daily-zmanim";
import { ZmanimWidget } from "@/components/zmanim-widget";
import { directionFor } from "@/i18n/routing";

export default async function HomePage() {
  const locale = await getLocale();
  const direction = directionFor(locale);
  const t = await getTranslations("Home");

  return (
    <main
      data-locale={locale}
      data-direction={direction}
      className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col px-6 py-12"
    >
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">{t("intro")}</p>
      <Suspense fallback={<ZmanimWidget initial={null} />}>
        <DailyZmanim />
      </Suspense>
    </main>
  );
}
