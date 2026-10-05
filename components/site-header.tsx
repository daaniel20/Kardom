import { getTranslations } from "next-intl/server";
import { HeaderSearch } from "@/components/header-search";
import { LanguageToggle } from "@/components/language-toggle";
import { UserAccount } from "@/components/user-account";
import { Link } from "@/i18n/navigation";

export async function SiteHeader() {
  const t = await getTranslations("Header");

  return (
    <header
      data-site-header
      className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-white/40 shadow-[0_8px_30px_rgb(60_77_94/0.06)] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-foreground"
        >
          {t("wordmark")}
        </Link>
        <HeaderSearch />
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <UserAccount />
        </div>
      </div>
    </header>
  );
}
