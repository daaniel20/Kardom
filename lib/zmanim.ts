export const JERUSALEM_GEONAME_ID = 281184;
export const JERUSALEM_TIME_ZONE = "Asia/Jerusalem";

export const ZMAN_IDS = [
  "alotHaShachar",
  "sunrise",
  "sofZmanShma",
  "sofZmanTfilla",
  "chatzot",
  "minchaGedola",
  "sunset",
  "tzeit",
] as const;

export type ZmanId = (typeof ZMAN_IDS)[number];

export const HEBCAL_ZMAN_KEY: Record<ZmanId, string> = {
  alotHaShachar: "alotHaShachar",
  sunrise: "sunrise",
  sofZmanShma: "sofZmanShma",
  sofZmanTfilla: "sofZmanTfilla",
  chatzot: "chatzot",
  minchaGedola: "minchaGedola",
  sunset: "sunset",
  tzeit: "tzeit85deg",
};

/**
 * Hebrew month numbers match daily_facts.hebrew_month:
 * 1 Tishrei through 12 Elul, 13 Adar II.
 * Adar and Adar I share 6 so a non-leap Adar still matches month 6.
 */
export const HEBREW_MONTH_NUMBER: Record<string, number> = {
  Tishrei: 1,
  Cheshvan: 2,
  Kislev: 3,
  Tevet: 4,
  "Sh'vat": 5,
  Adar: 6,
  "Adar I": 6,
  Nisan: 7,
  Iyyar: 8,
  Sivan: 9,
  Tamuz: 10,
  Av: 11,
  Elul: 12,
  "Adar II": 13,
};

export type LocationSource = "jerusalem" | "geolocation";

export type DailySnapshot = {
  hebrewDate: string;
  hebrewMonth: number | null;
  hebrewDay: number | null;
  hebrewYear: number | null;
  monthName: string | null;
  timeZone: string;
  locationSource: LocationSource;
  times: { id: ZmanId; iso: string }[];
  fact: string | null;
};

export type LocationInput = {
  latitude?: number;
  longitude?: number;
  timeZone?: string;
};

export function isTimeZone(value: string) {
  if (!/^[A-Za-z0-9_+\-/]{1,64}$/.test(value)) {
    return false;
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function parseLocation(params: URLSearchParams): LocationInput {
  const latitude = Number(params.get("latitude"));
  const longitude = Number(params.get("longitude"));
  const timeZone = params.get("tzid") ?? "";
  const coordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  if (!coordinates) {
    return {};
  }

  return {
    latitude,
    longitude,
    timeZone: timeZone && isTimeZone(timeZone) ? timeZone : undefined,
  };
}

export function isZmanId(value: string): value is ZmanId {
  return (ZMAN_IDS as readonly string[]).includes(value);
}
