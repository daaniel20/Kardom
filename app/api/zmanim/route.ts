import { NextRequest } from "next/server";
import { loadDailySnapshot } from "@/lib/daily-snapshot";
import { parseLocation } from "@/lib/zmanim";

export async function GET(request: NextRequest) {
  const snapshot = await loadDailySnapshot(parseLocation(request.nextUrl.searchParams));
  if (!snapshot) {
    return Response.json(
      { error: "unavailable" },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return Response.json(snapshot, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
