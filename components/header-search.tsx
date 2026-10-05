"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

export function HeaderSearch() {
  const t = useTranslations("Header");

  return (
    <form
      role="search"
      className="min-w-0 flex-1"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="relative block">
        <span className="sr-only">{t("searchLabel")}</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          name="q"
          autoComplete="off"
          placeholder={t("searchPlaceholder")}
          className="h-10 bg-white/70 ps-9"
        />
      </label>
    </form>
  );
}
