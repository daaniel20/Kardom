import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TopicPage } from "@/components/topic-page";
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
  const globe = await getTranslations("Globe");
  const topic = await getTranslations("Topic");
  const name = globe(`months.${id}`);
  return {
    title: name,
    description: topic(`months.${id}.content`).split("\n").join(" "),
  };
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
  return <TopicPage kind="month" id={id} />;
}
