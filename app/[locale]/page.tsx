import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { CycleGlobe } from "@/components/cycle-globe";
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
      className="fixed inset-0 z-0"
    >
      <h1 className="sr-only">{t("title")}</h1>
      <CycleGlobe />
      <Suspense fallback={<ZmanimWidget initial={null} />}>
        <DailyZmanim />
      </Suspense>
    </main>
  );
}
