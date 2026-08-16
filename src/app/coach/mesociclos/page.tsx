"use client";

import Link from "next/link";
import { useState } from "react";
import { currentWeekNumber, formatShort, toISODate, startOfDay } from "@/lib/dates";
import { defaultDayNames } from "@/lib/ids";
import { useScopedDemo } from "@/lib/store";
import { Button, Card, Empty, Field, Input, Modal, Select } from "@/components/ui";

export default function MesocyclesPage() {
  const { mesocycles, dispatch, client } = useScopedDemo();
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(4);
  const [names, setNames] = useState(defaultDayNames(4));

  function onDaysChange(value: number) {
    setDays(value);
    setNames(defaultDayNames(value));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Programación</p>
          <h1 className="font-display text-4xl italic">Mesociclos</h1>
          <p className="text-sm text-muted">{client.name}</p>
        </div>
        <Button onClick={() => setOpen(true)}>Nuevo mesociclo</Button>
      </div>

      {mesocycles.length === 0 ? (
        <Empty title="Sin mesociclos" body={`Crea el primer bloque de 12 semanas para ${client.name}.`} />
      ) : (
        <div className="space-y-3">
          {mesocycles.map((meso) => {
            const week = currentWeekNumber(meso.startDate);
            return (
              <Card key={meso.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{meso.name}</p>
                  <p className="text-sm text-muted">
                    Inicio {formatShort(meso.startDate)} · {meso.trainingDaysPerWeek} días/sem · {meso.calorieTarget} kcal
                    {meso.status === "active" ? ` · semana ${week}/12` : ` · ${meso.status}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/coach/mesociclos/${meso.id}`}>
                    <Button variant="secondary">Abrir</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} title="Nuevo mesociclo" onClose={() => setOpen(false)}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            dispatch({
              type: "CREATE_MESOCYCLE",
              payload: {
                clientId: client.id,
                name: String(data.get("name") || "Nuevo mesociclo"),
                startDate: String(data.get("startDate") || toISODate(startOfDay())),
                trainingDaysPerWeek: days,
                calorieTarget: Number(data.get("calorieTarget") || 2200),
                status: "active",
                dayNames: names.slice(0, days),
              },
            });
            setOpen(false);
          }}
        >
          <Field label="Nombre">
            <Input name="name" defaultValue="Fuerza · bloque 1" required />
          </Field>
          <Field label="Fecha de inicio">
            <Input name="startDate" type="date" defaultValue={toISODate(startOfDay())} required />
          </Field>
          <Field label="Días de entrenamiento">
            <Select value={days} onChange={(event) => onDaysChange(Number(event.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n} día{n > 1 ? "s" : ""} / semana
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-2 sm:grid-cols-2">
            {names.slice(0, days).map((name, index) => (
              <Field key={index} label={`Día ${index + 1}`}>
                <Input
                  value={name}
                  onChange={(event) =>
                    setNames((current) => current.map((item, i) => (i === index ? event.target.value : item)))
                  }
                />
              </Field>
            ))}
          </div>
          <Field label="Calorías objetivo">
            <Input name="calorieTarget" type="number" defaultValue={2400} min={1200} />
          </Field>
          <Button type="submit" className="w-full">
            Crear 12 microciclos
          </Button>
        </form>
      </Modal>
    </div>
  );
}
