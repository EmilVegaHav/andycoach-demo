export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

export function dayId(mesocycleId: string, week: number, day: number): string {
  return `${mesocycleId}-w${week}-d${day}`;
}

export function defaultDayNames(count: number): string[] {
  const presets: Record<number, string[]> = {
    1: ["Full Body"],
    2: ["Torso", "Piernas"],
    3: ["Empuje", "Tirón", "Piernas"],
    4: ["Torso", "Piernas", "Torso", "Piernas"],
    5: ["Empuje", "Tirón", "Piernas", "Empuje", "Tirón"],
    6: ["Empuje", "Tirón", "Piernas", "Empuje", "Tirón", "Piernas"],
    7: ["Full Body A", "Torso", "Piernas", "Empuje", "Tirón", "Full Body B", "Movilidad"],
  };
  return presets[count] ?? Array.from({ length: count }, (_, i) => `Día ${i + 1}`);
}
