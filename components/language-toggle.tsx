import { getLocale, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const labelKey: Record<AppLocale, "hebrew" | "english"> = {
  he: "hebrew",
  en: "english",
};

export async function LanguageToggle() {
  const locale = await getLocale();
  const t = await getTranslations("Home");

  return (
    <div className="flex flex-wrap gap-2">
      {routing.locales.map((item) => {
        const active = item === locale;
        return (
          <Link
            key={item}
            href="/"
            locale={item}
            hrefLang={item}
            aria-current={active ? "page" : undefined}
            className={cn(
              buttonVariants({
                variant: active ? "default" : "outline",
                size: "lg",
              }),
              "h-10 px-4",
            )}
          >
            {t(labelKey[item])}
          </Link>
        );
      })}
    </div>
  );
}
