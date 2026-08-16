"use client";

import Link from "next/link";
import { currentWeekNumber } from "@/lib/dates";
import { useScopedDemo } from "@/lib/store";
import { Card, Empty } from "@/components/ui";

export default function TrainingIndex() {
  const state = useScopedDemo();
  const meso = state.mesocycles.find((item) => item.status === "active") ?? state.mesocycles[0];
  if (!meso) return <Empty title="Sin rutina" body="Tu coach todavía no armó un mesociclo." />;
  const current = currentWeekNumber(meso.startDate);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Rutina</p>
        <h1 className="font-display text-4xl italic">{meso.name}</h1>
      </div>
      {Array.from({ length: current }, (_, index) => current - index).map((week) => {
        const days = state.trainingDays
          .filter((day) => day.mesocycleId === meso.id && day.weekNumber === week)
          .sort((a, b) => a.dayNumber - b.dayNumber);
        return (
          <Card key={week} className="space-y-3">
            <h2 className="font-medium">
              Microciclo {week}
              {week === current ? <span className="ml-2 text-sm font-normal text-accent">actual</span> : null}
            </h2>
            <ul className="space-y-2">
              {days.map((day) => {
                const count = state.exercises.filter((exercise) => exercise.trainingDayId === day.id).length;
                const done = state.sessions.some((session) => session.trainingDayId === day.id);
                return (
                  <li key={day.id}>
                    <Link
                      href={`/cliente/entrenamiento/${day.id}`}
                      className="flex items-center justify-between rounded-xl bg-paper px-3 py-3 text-sm"
                    >
                      <span>
                        Día {day.dayNumber} · {day.name}
                        <span className="text-muted"> · {count} ejercicios</span>
                      </span>
                      <span className={done ? "text-forest" : "text-muted"}>{done ? "Hecho" : "Abrir"}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
