export const MONTH_IDS = [
  "tishrei",
  "cheshvan",
  "kislev",
  "tevet",
  "shevat",
  "adar",
  "nisan",
  "iyar",
  "sivan",
  "tammuz",
  "av",
  "elul",
] as const;

export const EVENT_IDS = [
  "birth",
  "brit-milah",
  "simchat-bat",
  "pidyon-haben",
  "upsherin",
  "bar-mitzvah",
  "bat-mitzvah",
  "wedding",
] as const;

export type MonthId = (typeof MONTH_IDS)[number];
export type EventId = (typeof EVENT_IDS)[number];

export function isMonthId(id: string): id is MonthId {
  return (MONTH_IDS as readonly string[]).includes(id);
}

export function isEventId(id: string): id is EventId {
  return (EVENT_IDS as readonly string[]).includes(id);
}

export function wrapDegrees(value: number) {
  const turns = ((value % 360) + 360) % 360;
  return turns > 180 ? turns - 360 : turns;
}

export function snapToStep(value: number, step: number) {
  if (step === 0) {
    return value;
  }
  return Math.round(value / step) * step;
}

export function indexFromRotation(rotation: number, count: number) {
  if (count <= 0) {
    return 0;
  }
  const step = 360 / count;
  return ((Math.round(-rotation / step) % count) + count) % count;
}
