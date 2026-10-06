import { getLocale, getTranslations } from "next-intl/server";
import { AffiliateCarousel } from "@/components/affiliate-carousel";
import { CommunityMarket } from "@/components/community-market";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  buildSampleCatalog,
  loadAffiliateCatalog,
  recommendProducts,
} from "@/lib/affiliate-products";
import { cn } from "@/lib/utils";

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="mt-3 space-y-3">
      {text.split("\n\n").map((paragraph) => (
        <p key={paragraph} className="text-base leading-7 text-foreground/90">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export async function TopicPage({
  kind,
  id,
}: {
  kind: "month" | "event";
  id: string;
}) {
  const locale = await getLocale();
  const t = await getTranslations("Topic");
  const globe = await getTranslations("Globe");
  const group = kind === "month" ? "months" : "events";
  const name = globe(`${group}.${id}`);
  const otherLocale = locale === "he" ? "en" : "he";
  const other = await getTranslations({ locale: otherLocale, namespace: "Globe" });
  const catalog = await loadAffiliateCatalog();
  const usingSamples = catalog === null;
  const products = recommendProducts(
    catalog ??
      buildSampleCatalog((messageKey, field) => t(`samples.${messageKey}.${field}`)),
    id,
  );

  return (
    <main
      data-topic-page
      data-topic-kind={kind}
      data-topic-id={id}
      className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-16 px-4 py-10 sm:px-6"
    >
      <article className="max-w-2xl">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 bg-white/70 px-4")}
        >
          {t("back")}
        </Link>
        <p className="mt-8 text-sm font-medium text-muted-foreground">{t(kind)}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{name}</h1>
        <p
          className="mt-3 text-lg text-muted-foreground"
          lang={otherLocale}
          dir={otherLocale === "he" ? "rtl" : "ltr"}
        >
          {other(`${group}.${id}`)}
        </p>
      </article>

      <section data-topic-section="content" className="flex max-w-2xl flex-col gap-10">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t("contentHeading")}</h2>
          <Paragraphs text={t(`${group}.${id}.content`)} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t("infoHeading")}</h2>
          <Paragraphs text={t(`${group}.${id}.info`)} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t("customsHeading")}</h2>
          <Paragraphs text={t(`${group}.${id}.customs`)} />
        </div>
      </section>

      <AffiliateCarousel products={products} usingSamples={usingSamples} />
      <CommunityMarket />
    </main>
  );
}
