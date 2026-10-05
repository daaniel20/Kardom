import { loadDailySnapshot } from "@/lib/daily-snapshot";
import { ZmanimWidget } from "@/components/zmanim-widget";

export async function DailyZmanim() {
  const initial = await loadDailySnapshot({});
  return <ZmanimWidget initial={initial} />;
}
