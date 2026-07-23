import { z } from "zod";

export const DEFAULT_PLANNING_TIME_ZONE = "Europe/Paris";
export const isoWeekStartSchema = z.iso.date().refine((value) => {
  const date = new Date(`${value}T12:00:00Z`);
  return date.getUTCDay() === 1;
}, "La semaine doit commencer un lundi");

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export function addDaysToIsoDate(value: string, days: number) {
  const parsed = z.iso.date().parse(value);
  if (!Number.isInteger(days)) throw new RangeError("days must be an integer");
  const date = new Date(`${parsed}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

export function startOfIsoWeek(value: string) {
  const parsed = z.iso.date().parse(value);
  const date = new Date(`${parsed}T12:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return toIsoDate(date);
}

export function adjacentIsoWeek(
  weekStart: string,
  direction: "previous" | "next",
) {
  return addDaysToIsoDate(
    isoWeekStartSchema.parse(weekStart),
    direction === "previous" ? -7 : 7,
  );
}

export function isoWeekEnd(weekStart: string) {
  return addDaysToIsoDate(isoWeekStartSchema.parse(weekStart), 6);
}

export function localIsoDateAt(
  instant: Date,
  timeZone = DEFAULT_PLANNING_TIME_ZONE,
) {
  if (!Number.isFinite(instant.getTime())) throw new RangeError("invalid date");
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function currentIsoWeekStart(
  instant = new Date(),
  timeZone = DEFAULT_PLANNING_TIME_ZONE,
) {
  return startOfIsoWeek(localIsoDateAt(instant, timeZone));
}
