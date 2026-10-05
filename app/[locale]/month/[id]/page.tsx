import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TopicPlaceholder } from "@/components/topic-placeholder";
import { MONTH_IDS, isMonthId } from "@/lib/cycle";

export const dynamicParams = false;

export function generateStaticParams() {
  return MONTH_IDS.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isMonthId(id)) {
    return {};
  }
  const t = await getTranslations("Globe");
  return { title: t(`months.${id}`) };
}

export default async function MonthPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isMonthId(id)) {
    notFound();
  }
  return <TopicPlaceholder kind="month" id={id} />;
}
