import { OneOnOneConfig } from "../types";

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export function isOneOnOneDay(config: OneOnOneConfig, dateStr: string): boolean {
  const date = new Date(dateStr + "T12:00:00");
  const dayNum = DAY_MAP[config.dayOfWeek.toLowerCase()];
  if (dayNum === undefined || date.getDay() !== dayNum) return false;
  if (config.cadence === "weekly") return true;

  const anchor = new Date(config.startDate + "T12:00:00");
  const diffMs = date.getTime() - anchor.getTime();
  const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks % 2 === 0;
}

export function getNextOneOnOneDate(config: OneOnOneConfig, fromDate: string): string {
  const start = new Date(fromDate + "T12:00:00");
  for (let i = 0; i <= 14; i++) {
    const candidate = new Date(start);
    candidate.setDate(candidate.getDate() + i);
    const candidateStr = candidate.toISOString().split("T")[0];
    if (isOneOnOneDay(config, candidateStr)) {
      return candidateStr;
    }
  }
  return fromDate;
}
