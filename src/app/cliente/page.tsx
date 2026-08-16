"use client";

import Link from "next/link";
import { currentWeekNumber, formatShort, toISODate, startOfDay } from "@/lib/dates";
import { useDemo } from "@/lib/store";
import { Card } from "@/components/ui";

export default function ClientHome() {
  const state = useDemo();
  const today = toISODate(startOfDay());
  const meso = state.mesocycles.find((item) => item.status === "active") ?? state.mesocycles[0];
  const week = meso ? currentWeekNumber(meso.startDate) : 1;
  const days = meso
    ? state.trainingDays
        .filter((day) => day.mesocycleId === meso.id && day.weekNumber === week)
        .sort((a, b) => a.dayNumber - b.dayNumber)
    : [];
  const journal = state.journals.find((item) => item.date === today);
  const pendingFeedback = state.mesocycles.find(
    (item) => item.feedbackEnabled && !state.feedbackResponses.some((res) => res.mesocycleId === item.id),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Hola</p>
        <h1 className="font-display text-4xl italic">{state.client.name}</h1>
        <p className="text-muted">
          {meso ? `${meso.name} · microciclo ${week} de 12` : "Todavía no tienes mesociclo"}
        </p>
      </div>

      {pendingFeedback ? (
        <Link href="/cliente/feedback" className="block rounded-2xl bg-accent px-5 py-4 text-white">
          Tu coach habilitó el feedback de {pendingFeedback.name}. Llénalo aquí.
        </Link>
      ) : null}

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Entrenamientos de esta semana</h2>
          <Link href="/cliente/entrenamiento" className="text-sm text-accent">
            Ver todo
          </Link>
        </div>
        <ul className="space-y-2">
          {days.map((day) => {
            const done = state.sessions.some((session) => session.trainingDayId === day.id);
            return (
              <li key={day.id}>
                <Link
                  href={`/cliente/entrenamiento/${day.id}`}
                  className="flex items-center justify-between rounded-xl border border-line bg-white px-3 py-3"
                >
                  <span>
                    Día {day.dayNumber} · {day.name}
                  </span>
                  <span className={`text-xs ${done ? "text-forest" : "text-muted"}`}>
                    {done ? "Registrado" : "Pendiente"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      <Link href="/cliente/diario" className="block">
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Diario de hoy</p>
          <p className="mt-1 font-medium">{journal ? "Ya registraste el día" : "Falta llenar el diario"}</p>
          <p className="text-sm text-muted">{formatShort(today)}</p>
        </Card>
      </Link>

      {meso ? (
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Tu progreso</p>
          <p className="mt-1 text-sm text-muted">
            El coach ve el volumen y las medidas. Acá podés seguir las semanas anteriores en Entrenar.
          </p>
          <Link href="/cliente/medidas" className="mt-3 inline-block text-sm text-accent">
            Actualizar medidas y fotos
          </Link>
        </Card>
      ) : null}
    </div>
  );
}
