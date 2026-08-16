"use client";

import Link from "next/link";
import { currentWeekNumber } from "@/lib/dates";
import { scopeForClient } from "@/lib/selectors";
import { useDemo } from "@/lib/store";
import { weekVolume } from "@/lib/volume";
import { Card } from "@/components/ui";

export default function CoachClientsPage() {
  const state = useDemo();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Coach</p>
        <h1 className="font-display text-4xl italic">Clientes</h1>
        <p className="mt-1 text-muted">Elegí un cliente para ver su resumen, rutinas y seguimiento.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {state.clients.map((person) => {
          const scoped = scopeForClient(state, person.id);
          const meso = scoped.mesocycles.find((item) => item.status === "active") ?? scoped.mesocycles[0];
          const week = meso ? currentWeekNumber(meso.startDate) : null;
          const lastWeight = [...scoped.measurementEntries]
            .reverse()
            .map((entry) => Object.entries(entry.values).find(([key, value]) => key.includes("mf-peso") && typeof value === "number")?.[1])
            .find((value) => typeof value === "number");
          const volume = meso && week ? weekVolume(state, meso.id, Math.max(1, week - 1)) : 0;
          return (
            <Link key={person.id} href={`/coach/clientes/${person.id}`} className="block">
              <Card className="h-full transition hover:border-ink">
                <p className="font-display text-2xl italic">{person.name}</p>
                <p className="text-sm text-muted">{person.email}</p>
                <p className="mt-4 text-sm">
                  {meso ? `${meso.name} · semana ${week}/12` : "Sin mesociclo"}
                </p>
                <div className="mt-3 flex gap-4 text-sm text-muted">
                  <span>{typeof lastWeight === "number" ? `${lastWeight} kg` : "Sin peso"}</span>
                  <span>{Math.round(volume).toLocaleString("es-ES")} kg vol.</span>
                </div>
                <p className="mt-4 text-sm font-medium text-accent">Ver resumen</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
