import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TopicPlaceholder } from "@/components/topic-placeholder";
import { EVENT_IDS, isEventId } from "@/lib/cycle";

export const dynamicParams = false;

export function generateStaticParams() {
  return EVENT_IDS.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isEventId(id)) {
    return {};
  }
  const t = await getTranslations("Globe");
  return { title: t(`events.${id}`) };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isEventId(id)) {
    notFound();
  }
  return <TopicPlaceholder kind="event" id={id} />;
}
