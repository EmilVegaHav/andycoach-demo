"use client";

import Link from "next/link";
import { use, useState } from "react";
import { currentWeekNumber, formatShort, weekRange } from "@/lib/dates";
import { useDemo } from "@/lib/store";
import { Button, Card, Empty, Field, Input, Select } from "@/components/ui";
import { uid } from "@/lib/ids";
import { clientById } from "@/lib/selectors";
import type { FeedbackFieldType } from "@/lib/types";

export default function MesocyclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const state = useDemo();
  const meso = state.mesocycles.find((item) => item.id === id);
  const form = state.feedbackForms.find((item) => item.mesocycleId === id);
  const response = state.feedbackResponses.find((item) => item.mesocycleId === id);
  const [newField, setNewField] = useState({ type: "textarea" as FeedbackFieldType, label: "" });

  if (!meso) {
    return <Empty title="No encontrado" body="Ese mesociclo no existe en el demo." />;
  }

  const week = currentWeekNumber(meso.startDate);
  const fields = form?.fields ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/coach/mesociclos" className="text-sm text-accent">
            Mesociclos
          </Link>
          <h1 className="font-display text-4xl italic">{meso.name}</h1>
          <p className="text-muted">
            {formatShort(meso.startDate)} · {meso.trainingDaysPerWeek} días · objetivo {meso.calorieTarget} kcal
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              state.dispatch({
                type: "UPDATE_MESOCYCLE",
                id: meso.id,
                patch: { status: meso.status === "completed" ? "active" : "completed", feedbackEnabled: true },
              })
            }
          >
            {meso.status === "completed" ? "Reactivar" : "Cerrar mesociclo"}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("¿Eliminar este mesociclo?")) {
                state.dispatch({ type: "DELETE_MESOCYCLE", id: meso.id });
              }
            }}
          >
            Eliminar
          </Button>
        </div>
      </div>

      <Card>
        <h2 className="mb-3 font-medium">12 microciclos</h2>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {Array.from({ length: 12 }, (_, index) => {
            const n = index + 1;
            const range = weekRange(meso.startDate, n);
            const current = n === week && meso.status === "active";
            return (
              <Link
                key={n}
                href={`/coach/mesociclos/${meso.id}/semana/${n}`}
                className={`rounded-xl border px-2 py-3 text-center text-sm ${
                  current ? "border-accent bg-accent text-white" : "border-line bg-white hover:border-ink"
                }`}
              >
                <span className="block font-medium">{n}</span>
                <span className={`text-[10px] ${current ? "text-white/80" : "text-muted"}`}>
                  {formatShort(range.from)}
                </span>
              </Link>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Feedback de cierre</h2>
            <p className="text-sm text-muted">Formulario libre que el cliente llena al terminar el bloque.</p>
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              state.dispatch({
                type: "UPDATE_MESOCYCLE",
                id: meso.id,
                patch: { feedbackEnabled: !meso.feedbackEnabled },
              })
            }
          >
            {meso.feedbackEnabled ? "Ocultar al cliente" : "Habilitar al cliente"}
          </Button>
        </div>
        <ul className="space-y-2">
          {fields.map((field) => (
            <li key={field.id} className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2 text-sm">
              <span>
                {field.label} <span className="text-muted">· {field.type}</span>
              </span>
              <button
                className="text-muted hover:text-red-700"
                onClick={() =>
                  state.dispatch({
                    type: "SAVE_FEEDBACK_FORM",
                    form: { mesocycleId: meso.id, fields: fields.filter((item) => item.id !== field.id) },
                  })
                }
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={newField.type}
            onChange={(event) => setNewField((current) => ({ ...current, type: event.target.value as FeedbackFieldType }))}
          >
            <option value="text">Texto corto</option>
            <option value="textarea">Párrafo</option>
            <option value="scale">Escala 1–5</option>
            <option value="yesno">Sí / No</option>
          </Select>
          <Input
            placeholder="Pregunta"
            value={newField.label}
            onChange={(event) => setNewField((current) => ({ ...current, label: event.target.value }))}
          />
          <Button
            type="button"
            onClick={() => {
              if (!newField.label.trim()) return;
              state.dispatch({
                type: "SAVE_FEEDBACK_FORM",
                form: {
                  mesocycleId: meso.id,
                  fields: [...fields, { id: uid("ff"), type: newField.type, label: newField.label.trim() }],
                },
              });
              setNewField({ type: "textarea", label: "" });
            }}
          >
            Agregar
          </Button>
        </div>
        {response ? (
          <div className="rounded-xl bg-paper p-4 text-sm">
            <p className="mb-2 font-medium">Respuesta de {clientById(state, meso.clientId).name}</p>
            {fields.map((field) => (
              <p key={field.id} className="mt-1">
                <span className="text-muted">{field.label}: </span>
                {String(response.answers[field.id] ?? "—")}
              </p>
            ))}
          </div>
        ) : null}
      </Card>

      <Card>
        <Field label="Calorías objetivo (se muestran en el diario del cliente)">
          <Input
            type="number"
            defaultValue={meso.calorieTarget}
            onBlur={(event) =>
              state.dispatch({
                type: "UPDATE_MESOCYCLE",
                id: meso.id,
                patch: { calorieTarget: Number(event.target.value) },
              })
            }
          />
        </Field>
      </Card>
    </div>
  );
}
