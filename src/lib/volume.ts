import type { DemoState } from "./types";

export function sessionVolume(state: DemoState, sessionId: string): number {
  return state.setLogs
    .filter((log) => log.sessionId === sessionId)
    .reduce((sum, log) => sum + log.reps * log.weight, 0);
}

export function weekVolume(state: DemoState, mesocycleId: string, weekNumber: number): number {
  const dayIds = new Set(
    state.trainingDays
      .filter((day) => day.mesocycleId === mesocycleId && day.weekNumber === weekNumber)
      .map((day) => day.id),
  );
  const sessionIds = new Set(
    state.sessions.filter((session) => dayIds.has(session.trainingDayId)).map((session) => session.id),
  );
  return state.setLogs
    .filter((log) => sessionIds.has(log.sessionId))
    .reduce((sum, log) => sum + log.reps * log.weight, 0);
}

export function macrosToCalories(protein: number | null, carbs: number | null, fats: number | null): number | null {
  if (protein == null || carbs == null || fats == null) return null;
  return Math.round(protein * 4 + carbs * 4 + fats * 9);
}
