import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { CatalogProduct, ProductTone } from "@/lib/affiliate-products";
import { isEventId, isMonthId } from "@/lib/cycle";
import { cn } from "@/lib/utils";

const toneClass: Record<ProductTone, string> = {
  green: "bg-[linear-gradient(145deg,#d9f5e4,#9fd0f2)]",
  peach: "bg-[linear-gradient(145deg,#ffe3cc,#ffc2d4)]",
  pink: "bg-[linear-gradient(145deg,#ffd0de,#e7f2fa)]",
  blue: "bg-[linear-gradient(145deg,#d4ecfb,#ffffff)]",
};

function categoryLabel(tag: string | null, globe: (key: string) => string, general: string) {
  if (!tag) {
    return general;
  }
  if (isMonthId(tag)) {
    return globe(`months.${tag}`);
  }
  if (isEventId(tag)) {
    return globe(`events.${tag}`);
  }
  return tag;
}

export async function AffiliateCarousel({
  products,
  usingSamples,
}: {
  products: CatalogProduct[];
  usingSamples: boolean;
}) {
  const t = await getTranslations("Topic");
  const globe = await getTranslations("Globe");

  return (
    <section data-topic-section="marketplace" aria-labelledby="topic-marketplace" className="min-w-0">
      <div className="max-w-2xl">
        <h2 id="topic-marketplace" className="text-2xl font-semibold tracking-tight">
          {t("marketplaceHeading")}
        </h2>
        <p className="mt-2 text-base leading-7 text-muted-foreground">{t("marketplaceLead")}</p>
        {usingSamples ? (
          <p className="mt-2 text-sm font-medium text-foreground/80" data-product-source="sample">
            {t("sampleNote")}
          </p>
        ) : (
          <p className="sr-only" data-product-source="live">
            {t("marketplaceHeading")}
          </p>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{t("scrollHint")}</p>
      <div
        data-affiliate-carousel
        tabIndex={0}
        aria-label={t("carouselLabel")}
        className="topic-carousel mt-4 flex w-full max-w-full snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3"
      >
        {products.map((product) => {
          const label = categoryLabel(product.categoryTag, globe, t("generalCategory"));
          return (
            <a
              key={product.id}
              href={product.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              data-affiliate-product={product.id}
              data-sample={product.sample ? "true" : "false"}
              aria-label={t("openProduct", { title: product.title })}
              className="w-72 shrink-0 snap-start rounded-2xl border border-white/80 bg-white/75 text-card-foreground shadow-[0_16px_40px_rgb(60_77_94/0.08)] backdrop-blur-xl"
            >
              <div className={cn("relative aspect-[4/3] overflow-hidden rounded-t-2xl", toneClass[product.tone])}>
                {product.imageUrl ? (
                  // Store images are arbitrary external URLs and are not run through the optimizer.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
                ) : null}
                {product.sample ? (
                  <span className="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground">
                    {t("sampleBadge")}
                  </span>
                ) : null}
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <h3 className="text-lg font-semibold leading-snug">{product.title}</h3>
                {product.description ? (
                  <p className="line-clamp-3 text-sm leading-6 text-foreground/80">{product.description}</p>
                ) : null}
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <ExternalLink aria-hidden="true" className="size-4" />
                  <span dir="ltr">{new URL(product.externalLink).host}</span>
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
