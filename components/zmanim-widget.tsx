"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { isZmanId, type DailySnapshot } from "@/lib/zmanim";

const widgetClassName =
  "fixed bottom-4 end-4 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/70 bg-white/50 p-4 text-card-foreground shadow-[0_16px_40px_rgb(60_77_94/0.12)] backdrop-blur-xl";

function isSnapshot(value: unknown): value is DailySnapshot {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const snapshot = value as Partial<DailySnapshot>;
  return (
    typeof snapshot.hebrewDate === "string" &&
    typeof snapshot.timeZone === "string" &&
    (snapshot.locationSource === "jerusalem" ||
      snapshot.locationSource === "geolocation") &&
    Array.isArray(snapshot.times)
  );
}

function formatZman(iso: string, locale: string, timeZone: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  try {
    return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date);
  }
}

async function requestSnapshot(coords?: GeolocationCoordinates) {
  const params = new URLSearchParams();
  if (coords) {
    params.set("latitude", String(coords.latitude));
    params.set("longitude", String(coords.longitude));
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) {
      params.set("tzid", timeZone);
    }
  }

  const response = await fetch(`/api/zmanim?${params.toString()}`);
  if (!response.ok) {
    return null;
  }
  const body: unknown = await response.json();
  return isSnapshot(body) ? body : null;
}

export function ZmanimWidget({ initial }: { initial: DailySnapshot | null }) {
  const t = useTranslations("Zmanim");
  const locale = useLocale();
  const [snapshot, setSnapshot] = useState(initial);
  const [phase, setPhase] = useState<"loading" | "ready" | "unavailable">(
    initial ? "ready" : "loading",
  );

  useEffect(() => {
    let cancelled = false;

    function apply(next: DailySnapshot | null) {
      if (cancelled) {
        return;
      }
      if (next) {
        setSnapshot(next);
        setPhase("ready");
        return;
      }
      setPhase((current) => (current === "ready" ? "ready" : "unavailable"));
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      if (!initial) {
        void requestSnapshot()
          .then(apply)
          .catch(() => apply(null));
      }
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void requestSnapshot(position.coords)
          .then(apply)
          .catch(() => apply(null));
      },
      () => {
        if (!initial) {
          void requestSnapshot()
            .then(apply)
            .catch(() => apply(null));
        }
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 8000 },
    );

    return () => {
      cancelled = true;
    };
  }, [initial]);

  const monthLabel = snapshot
    ? snapshot.monthName === "Adar I"
      ? t("months.adar1")
      : snapshot.hebrewMonth
        ? t(`months.${snapshot.hebrewMonth}`)
        : (snapshot.monthName ?? "")
    : "";
  const dateText =
    snapshot == null
      ? ""
      : locale === "he" || snapshot.hebrewDay == null || !monthLabel
        ? snapshot.hebrewDate
        : t("englishDate", {
            day: snapshot.hebrewDay,
            month: monthLabel,
            year: snapshot.hebrewYear ?? "",
          });

  return (
    <aside
      data-zmanim-widget
      data-location-source={snapshot?.locationSource ?? "pending"}
      aria-label={t("title")}
      className={widgetClassName}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground">
        {t("title")}
      </p>

      {phase === "loading" ? (
        <p className="mt-3 text-sm text-muted-foreground">{t("loading")}</p>
      ) : null}

      {phase === "unavailable" ? (
        <p className="mt-3 text-sm text-muted-foreground">{t("unavailable")}</p>
      ) : null}

      {snapshot && phase === "ready" ? (
        <div className="mt-2">
          <p className="text-lg font-semibold leading-snug" data-hebrew-date>
            {dateText}
          </p>
          <p className="mt-1 text-xs text-muted-foreground" data-zmanim-location>
            {t(
              snapshot.locationSource === "geolocation"
                ? "locationCurrent"
                : "locationJerusalem",
            )}
          </p>
          <dl className="mt-3 grid gap-1.5 text-sm">
            {snapshot.times.filter((time) => isZmanId(time.id)).map((time) => (
              <div key={time.id} className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">{t(time.id)}</dt>
                <dd className="font-medium tabular-nums" dir="ltr" data-zman={time.id}>
                  {formatZman(time.iso, locale, snapshot.timeZone)}
                </dd>
              </div>
            ))}
          </dl>
          <p
            className="mt-3 border-t border-white/70 pt-3 text-sm leading-relaxed"
            data-daily-fact={snapshot.fact ? "present" : "empty"}
            dir="auto"
          >
            {snapshot.fact ? (
              snapshot.fact
            ) : (
              <span className="text-muted-foreground">{t("factEmpty")}</span>
            )}
          </p>
        </div>
      ) : null}
    </aside>
  );
}
