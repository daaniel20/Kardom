import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TopicPage } from "@/components/topic-page";
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
  const globe = await getTranslations("Globe");
  const topic = await getTranslations("Topic");
  const name = globe(`events.${id}`);
  return {
    title: name,
    description: topic(`events.${id}.content`).split("\n").join(" "),
  };
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
  return <TopicPage kind="event" id={id} />;
}
