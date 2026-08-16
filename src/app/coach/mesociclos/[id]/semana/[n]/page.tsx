"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { currentWeekNumber } from "@/lib/dates";
import { useDemo } from "@/lib/store";
import type { ExerciseSection, RoutineExercise } from "@/lib/types";
import { Button, Card, Empty, Field, Input, Textarea } from "@/components/ui";

const sections: { id: ExerciseSection; label: string }[] = [
  { id: "warmup", label: "Calentamiento" },
  { id: "strength", label: "Fuerza" },
  { id: "cardio", label: "Cardio" },
];

function ExerciseEditor({ exercise }: { exercise: RoutineExercise }) {
  const { dispatch } = useDemo();
  return (
    <div className="grid gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-[1fr_70px_80px_80px_auto]">
      <Input
        value={exercise.name}
        onChange={(event) => dispatch({ type: "UPDATE_EXERCISE", id: exercise.id, patch: { name: event.target.value } })}
      />
      <Input
        type="number"
        min={1}
        value={exercise.sets}
        onChange={(event) =>
          dispatch({ type: "UPDATE_EXERCISE", id: exercise.id, patch: { sets: Number(event.target.value) } })
        }
        title="Series"
      />
      <Input
        value={exercise.reps}
        onChange={(event) => dispatch({ type: "UPDATE_EXERCISE", id: exercise.id, patch: { reps: event.target.value } })}
        title="Reps"
      />
      <Input
        type="number"
        placeholder="kg"
        value={exercise.weight ?? ""}
        onChange={(event) =>
          dispatch({
            type: "UPDATE_EXERCISE",
            id: exercise.id,
            patch: { weight: event.target.value === "" ? null : Number(event.target.value) },
          })
        }
      />
      <button
        className="text-sm text-muted hover:text-red-700"
        onClick={() => dispatch({ type: "DELETE_EXERCISE", id: exercise.id })}
      >
        Quitar
      </button>
      <div className="sm:col-span-5">
        <Textarea
          placeholder="Nota para el cliente…"
          value={exercise.coachNotes}
          onChange={(event) =>
            dispatch({ type: "UPDATE_EXERCISE", id: exercise.id, patch: { coachNotes: event.target.value } })
          }
        />
      </div>
    </div>
  );
}

function AddExercise({ trainingDayId, section }: { trainingDayId: string; section: ExerciseSection }) {
  const { dispatch } = useDemo();
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button className="text-sm text-accent" onClick={() => setOpen(true)}>
        + Ejercicio
      </button>
    );
  }
  return (
    <form
      className="grid gap-2 rounded-xl bg-paper p-3 sm:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        dispatch({
          type: "ADD_EXERCISE",
          payload: {
            trainingDayId,
            section,
            name: String(data.get("name")),
            sets: Number(data.get("sets") || 3),
            reps: String(data.get("reps") || "8-10"),
            weight: data.get("weight") ? Number(data.get("weight")) : null,
            coachNotes: String(data.get("notes") || ""),
          },
        });
        setOpen(false);
      }}
    >
      <Field label="Ejercicio">
        <Input name="name" required placeholder="Sentadilla" />
      </Field>
      <Field label="Series">
        <Input name="sets" type="number" defaultValue={3} />
      </Field>
      <Field label="Reps">
        <Input name="reps" defaultValue="8-10" />
      </Field>
      <Field label="Peso (kg)">
        <Input name="weight" type="number" />
      </Field>
      <div className="sm:col-span-4">
        <Field label="Nota al cliente">
          <Input name="notes" placeholder="Opcional" />
        </Field>
      </div>
      <div className="flex gap-2 sm:col-span-4">
        <Button type="submit">Agregar</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default function WeekPage({ params }: { params: Promise<{ id: string; n: string }> }) {
  const { id, n } = use(params);
  const week = Number(n);
  const state = useDemo();
  const meso = state.mesocycles.find((item) => item.id === id);
  const current = meso ? currentWeekNumber(meso.startDate) : 1;
  const days = useMemo(
    () =>
      state.trainingDays
        .filter((day) => day.mesocycleId === id && day.weekNumber === week)
        .sort((a, b) => a.dayNumber - b.dayNumber),
    [state.trainingDays, id, week],
  );

  if (!meso || week < 1 || week > 12) {
    return <Empty title="Microciclo no válido" body="Revisa el mesociclo y el número de semana." />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href={`/coach/mesociclos/${meso.id}`} className="text-sm text-accent">
            {meso.name}
          </Link>
          <h1 className="font-display text-4xl italic">Microciclo {week}</h1>
          <p className="text-muted">{week === current ? "Semana actual del cliente" : `Semana ${week} de 12`}</p>
        </div>
        {week > 1 ? (
          <Button
            variant="secondary"
            onClick={() => {
              if (confirm(`¿Copiar la rutina del microciclo ${week - 1}? Se reemplazan los ejercicios de esta semana.`)) {
                state.dispatch({ type: "COPY_WEEK", mesocycleId: meso.id, fromWeek: week - 1, toWeek: week });
              }
            }}
          >
            Copiar del microciclo {week - 1}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 12 }, (_, index) => (
          <Link
            key={index}
            href={`/coach/mesociclos/${meso.id}/semana/${index + 1}`}
            className={`rounded-lg px-2.5 py-1 text-sm ${
              index + 1 === week ? "bg-ink text-paper" : "bg-white text-muted hover:text-ink"
            }`}
          >
            {index + 1}
          </Link>
        ))}
      </div>

      {days.map((day) => {
        const exercises = state.exercises
          .filter((exercise) => exercise.trainingDayId === day.id)
          .sort((a, b) => a.orderIndex - b.orderIndex);
        return (
          <Card key={day.id} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted">Día {day.dayNumber}</p>
              <Input
                className="max-w-xs font-medium"
                value={day.name}
                onChange={(event) => state.dispatch({ type: "SET_DAY_NAME", id: day.id, name: event.target.value })}
              />
            </div>
            {sections.map((section) => (
              <div key={section.id} className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{section.label}</p>
                {exercises
                  .filter((exercise) => exercise.section === section.id)
                  .map((exercise) => (
                    <ExerciseEditor key={exercise.id} exercise={exercise} />
                  ))}
                <AddExercise trainingDayId={day.id} section={section.id} />
              </div>
            ))}
          </Card>
        );
      })}
    </div>
  );
}
