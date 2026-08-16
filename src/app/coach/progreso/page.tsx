"use client";

import { formatShort } from "@/lib/dates";
import { useDemo } from "@/lib/store";
import { weekVolume } from "@/lib/volume";
import { Card, Empty } from "@/components/ui";

export default function ProgressPage() {
  const state = useDemo();
  const meso = state.mesocycles.find((item) => item.status === "active") ?? state.mesocycles[0];

  if (!meso) return <Empty title="Sin mesociclo" body="Crea un mesociclo para ver volumen y cargas." />;

  const volumes = Array.from({ length: 12 }, (_, index) => weekVolume(state, meso.id, index + 1));
  const max = Math.max(...volumes, 1);
  const notes = [...state.exerciseNotes].reverse();
  const weightSeries = state.measurementEntries
    .map((entry) => ({ date: entry.date, peso: entry.values["mf-peso"] }))
    .filter((item) => typeof item.peso === "number");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Seguimiento</p>
        <h1 className="font-display text-4xl italic">Progreso de {state.client.name}</h1>
      </div>
      <Card>
        <h2 className="mb-4 font-medium">Volumen por microciclo (kg · series × reps × peso)</h2>
        <div className="flex h-48 items-end gap-2">
          {volumes.map((value, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-accent/80"
                style={{ height: `${Math.max(4, (value / max) * 100)}%` }}
                title={`${Math.round(value)} kg`}
              />
              <span className="text-[10px] text-muted">{index + 1}</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-medium">Peso corporal</h2>
          <ul className="space-y-2 text-sm">
            {weightSeries.map((item) => (
              <li key={item.date} className="flex justify-between">
                <span className="text-muted">{formatShort(item.date)}</span>
                <span>{item.peso} kg</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-3 font-medium">Notas del cliente en ejercicios</h2>
          {notes.length === 0 ? (
            <p className="text-sm text-muted">Todavía no dejó notas.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {notes.slice(0, 8).map((note) => {
                const exercise = state.exercises.find((item) => item.id === note.exerciseId);
                return (
                  <li key={`${note.sessionId}-${note.exerciseId}`}>
                    <p className="font-medium">{exercise?.name ?? "Ejercicio"}</p>
                    <p className="text-muted">{note.note}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
      <Card>
        <h2 className="mb-3 font-medium">Sesiones registradas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-2">Fecha</th>
                <th>Día</th>
                <th>Semana</th>
                <th className="text-right">Volumen</th>
              </tr>
            </thead>
            <tbody>
              {[...state.sessions].reverse().map((session) => {
                const day = state.trainingDays.find((item) => item.id === session.trainingDayId);
                const kg = state.setLogs
                  .filter((log) => log.sessionId === session.id)
                  .reduce((sum, log) => sum + log.reps * log.weight, 0);
                return (
                  <tr key={session.id} className="border-t border-line">
                    <td className="py-2">{formatShort(session.date)}</td>
                    <td>{day?.name}</td>
                    <td>{day?.weekNumber}</td>
                    <td className="text-right">{Math.round(kg).toLocaleString("es-ES")} kg</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
