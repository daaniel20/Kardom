import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["he", "en"],
  defaultLocale: "he",
  localePrefix: "as-needed",
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];

export function directionFor(locale: string): "rtl" | "ltr" {
  return locale === "he" ? "rtl" : "ltr";
}
