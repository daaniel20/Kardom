"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const labelKey: Record<AppLocale, "hebrew" | "english"> = {
  he: "hebrew",
  en: "english",
};

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Header");
  const nextLocale: AppLocale = locale === "he" ? "en" : "he";

  return (
    <Link
      href={pathname || "/"}
      locale={nextLocale}
      hrefLang={nextLocale}
      aria-label={t("switchTo", { language: t(labelKey[nextLocale]) })}
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "h-10 gap-2 bg-white/70 px-3",
      )}
    >
      <Globe aria-hidden="true" />
      <span>{t(labelKey[nextLocale])}</span>
    </Link>
  );
}
