export function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

export function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(value: string): Date {
  return startOfDay(new Date(`${value}T12:00:00`));
}

export function formatLong(value: string): string {
  return parseISODate(value).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatShort(value: string): string {
  return parseISODate(value).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

export function currentWeekNumber(startDate: string, today = new Date()): number {
  const start = parseISODate(startDate);
  const now = startOfDay(today);
  const diff = Math.floor((now.getTime() - start.getTime()) / (7 * 86400000));
  return Math.min(12, Math.max(1, diff + 1));
}

export function weekRange(startDate: string, weekNumber: number): { from: string; to: string } {
  const from = addDays(parseISODate(startDate), (weekNumber - 1) * 7);
  const to = addDays(from, 6);
  return { from: toISODate(from), to: toISODate(to) };
}
