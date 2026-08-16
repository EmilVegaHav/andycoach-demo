"use client";

import Link from "next/link";
import { currentWeekNumber, formatShort } from "@/lib/dates";
import { useDemo } from "@/lib/store";
import { macrosToCalories, weekVolume } from "@/lib/volume";
import { Card } from "@/components/ui";

export default function CoachHome() {
  const state = useDemo();
  const meso = state.mesocycles.find((item) => item.status === "active") ?? state.mesocycles[0];
  const week = meso ? currentWeekNumber(meso.startDate) : 1;
  const lastJournals = [...state.journals].slice(-7);
  const avgDiet =
    lastJournals.length > 0
      ? (lastJournals.reduce((sum, item) => sum + item.dietCompliance, 0) / lastJournals.length).toFixed(1)
      : "—";
  const lastWeight = [...state.measurementEntries]
    .reverse()
    .map((entry) => entry.values["mf-peso"])
    .find((value) => typeof value === "number");
  const volume = meso ? weekVolume(state, meso.id, Math.max(1, week - 1)) : 0;
  const lastJournal = state.journals.at(-1);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Coach</p>
        <h1 className="font-display text-4xl italic">{state.client.name}</h1>
        <p className="mt-1 text-muted">
          {meso ? `${meso.name} · microciclo ${week} de 12 · ${meso.trainingDaysPerWeek} días/sem` : "Sin mesociclo activo"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Volumen semana anterior</p>
          <p className="mt-2 font-display text-3xl">{Math.round(volume).toLocaleString("es-ES")} kg</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Cumplimiento dieta (7d)</p>
          <p className="mt-2 font-display text-3xl">{avgDiet}<span className="text-lg text-muted"> / 5</span></p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Último peso</p>
          <p className="mt-2 font-display text-3xl">{typeof lastWeight === "number" ? `${lastWeight} kg` : "—"}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Últimos entrenos</h2>
            <Link href="/coach/progreso" className="text-sm text-accent">
              Ver progreso
            </Link>
          </div>
          <ul className="space-y-3">
            {state.sessions.slice(-4).reverse().map((session) => {
              const day = state.trainingDays.find((item) => item.id === session.trainingDayId);
              const kg = state.setLogs
                .filter((log) => log.sessionId === session.id)
                .reduce((sum, log) => sum + log.reps * log.weight, 0);
              return (
                <li key={session.id} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="font-medium">{day?.name}</span>
                    <span className="text-muted"> · {formatShort(session.date)}</span>
                  </span>
                  <span className="text-muted">{Math.round(kg).toLocaleString("es-ES")} kg</span>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Diario reciente</h2>
            <Link href="/coach/diario" className="text-sm text-accent">
              Ver diario
            </Link>
          </div>
          {lastJournal ? (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">Fecha</dt>
                <dd>{formatShort(lastJournal.date)}</dd>
              </div>
              <div>
                <dt className="text-muted">Calorías (macros)</dt>
                <dd>{macrosToCalories(lastJournal.protein, lastJournal.carbs, lastJournal.fats) ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Entrenó</dt>
                <dd>{lastJournal.trained ? "Sí" : "No"}</dd>
              </div>
              <div>
                <dt className="text-muted">Sueño</dt>
                <dd>{lastJournal.sleepHours ?? "—"} h · calidad {lastJournal.sleepQuality}/5</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted">Todavía no hay registros.</p>
          )}
        </Card>
      </div>

      {meso ? (
        <Link
          href={`/coach/mesociclos/${meso.id}/semana/${week}`}
          className="block rounded-2xl bg-ink px-5 py-4 text-paper"
        >
          <p className="text-xs uppercase tracking-wide text-white/50">Ir al microciclo actual</p>
          <p className="font-display text-2xl italic">Editar rutinas de la semana {week}</p>
        </Link>
      ) : null}
    </div>
  );
}
