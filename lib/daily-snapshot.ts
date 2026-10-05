import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  HEBCAL_ZMAN_KEY,
  HEBREW_MONTH_NUMBER,
  JERUSALEM_GEONAME_ID,
  JERUSALEM_TIME_ZONE,
  ZMAN_IDS,
  isTimeZone,
  type DailySnapshot,
  type LocationInput,
} from "@/lib/zmanim";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function civilDate(timeZone: string, now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
  };
}

async function fetchHebcal(url: string): Promise<unknown> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`Hebcal responded with ${response.status}`);
  }
  return response.json();
}

function zmanimRequest(location: LocationInput, date: string, timeZone: string) {
  const params = new URLSearchParams({ cfg: "json", date });
  if (location.latitude != null && location.longitude != null) {
    params.set("latitude", location.latitude.toFixed(4));
    params.set("longitude", location.longitude.toFixed(4));
    params.set("tzid", location.timeZone ?? timeZone);
    return `https://www.hebcal.com/zmanim?${params}`;
  }

  params.set("geonameid", String(JERUSALEM_GEONAME_ID));
  return `https://www.hebcal.com/zmanim?${params}`;
}

async function lookupFact(hebrewMonth: number, hebrewDay: number) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from("daily_facts")
      .select("fact_text")
      .eq("hebrew_month", hebrewMonth)
      .eq("hebrew_day", hebrewDay)
      .order("created_at", { ascending: true })
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    const fact = data[0]?.fact_text;
    return typeof fact === "string" && fact.trim() ? fact.trim() : null;
  } catch {
    return null;
  }
}

export async function loadDailySnapshot(
  location: LocationInput,
): Promise<DailySnapshot | null> {
  await connection();

  const usingGeolocation =
    location.latitude != null && location.longitude != null;
  const timeZone =
    (usingGeolocation ? location.timeZone : undefined) ?? JERUSALEM_TIME_ZONE;
  const now = new Date();
  const today = civilDate(timeZone, now);
  if (!today.year || !today.month || !today.day) {
    return null;
  }

  const date = [
    String(today.year).padStart(4, "0"),
    String(today.month).padStart(2, "0"),
    String(today.day).padStart(2, "0"),
  ].join("-");

  try {
    const zmanimBody = await fetchHebcal(zmanimRequest(location, date, timeZone));
    const timesRecord =
      isRecord(zmanimBody) && isRecord(zmanimBody.times) ? zmanimBody.times : null;
    if (!timesRecord) {
      return null;
    }

    const times = ZMAN_IDS.flatMap((id) => {
      const iso = timesRecord[HEBCAL_ZMAN_KEY[id]];
      return typeof iso === "string" ? [{ id, iso }] : [];
    });
    if (times.length === 0) {
      return null;
    }

    const sunset = timesRecord.sunset;
    const afterSunset =
      typeof sunset === "string" &&
      !Number.isNaN(new Date(sunset).getTime()) &&
      now.getTime() >= new Date(sunset).getTime();

    const converterParams = new URLSearchParams({
      cfg: "json",
      g2h: "1",
      gy: String(today.year),
      gm: String(today.month),
      gd: String(today.day),
    });
    if (afterSunset) {
      converterParams.set("gs", "on");
    }

    const converterBody = await fetchHebcal(
      `https://www.hebcal.com/converter?${converterParams}`,
    );
    if (!isRecord(converterBody) || typeof converterBody.hebrew !== "string") {
      return null;
    }

    const monthName =
      typeof converterBody.hm === "string" ? converterBody.hm : null;
    const hebrewMonth = monthName ? (HEBREW_MONTH_NUMBER[monthName] ?? null) : null;
    const hebrewDay =
      typeof converterBody.hd === "number" ? converterBody.hd : null;
    const hebrewYear =
      typeof converterBody.hy === "number" ? converterBody.hy : null;
    const fact =
      hebrewMonth && hebrewDay
        ? await lookupFact(hebrewMonth, hebrewDay)
        : null;

    const locationRecord =
      isRecord(zmanimBody) && isRecord(zmanimBody.location)
        ? zmanimBody.location
        : null;
    const reportedZone =
      locationRecord &&
      typeof locationRecord.tzid === "string" &&
      isTimeZone(locationRecord.tzid)
        ? locationRecord.tzid
        : timeZone;

    return {
      hebrewDate: converterBody.hebrew,
      hebrewMonth,
      hebrewDay,
      hebrewYear,
      monthName,
      timeZone: reportedZone,
      locationSource: usingGeolocation ? "geolocation" : "jerusalem",
      times,
      fact,
    };
  } catch {
    return null;
  }
}
