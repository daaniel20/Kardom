import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORY_KEYS = ["clothing", "books", "ritual", "kids"] as const;
const EMPTY_SLOTS = ["one", "two", "three", "four"] as const;

export async function CommunityMarket() {
  const t = await getTranslations("Topic");

  return (
    <section
      data-topic-section="market"
      data-market-state="coming-soon"
      aria-labelledby="topic-market"
      className="rounded-3xl border border-dashed border-foreground/15 bg-white/45 p-6 shadow-[0_16px_40px_rgb(60_77_94/0.05)] sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="topic-market" className="text-2xl font-semibold tracking-tight">
          {t("marketHeading")}
        </h2>
        <span
          data-coming-soon
          className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground"
        >
          {t("comingSoon")}
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{t("marketLead")}</p>

      <fieldset disabled className="mt-6 min-w-0 border-0 p-0 opacity-60">
        <legend className="sr-only">{t("marketControls")}</legend>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            placeholder={t("marketSearch")}
            aria-label={t("marketSearch")}
            className="h-10 w-full rounded-lg border border-border bg-white/80 px-3 text-sm"
          />
          <button
            type="button"
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "h-10 px-4")}
          >
            {t("listItem")}
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {CATEGORY_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className="shrink-0 rounded-full border border-border bg-white/70 px-3 py-1.5 text-sm"
            >
              {t(`marketCategories.${key}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {EMPTY_SLOTS.map((slot) => (
          <li
            key={slot}
            data-market-slot="empty"
            className="rounded-2xl border border-dashed border-foreground/15 bg-white/50 p-3"
          >
            <div aria-hidden="true" className="aspect-[4/3] rounded-xl bg-muted" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">{t("emptyShelf")}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-2xl text-sm leading-6 text-foreground/80">{t("marketClosed")}</p>
    </section>
  );
}
