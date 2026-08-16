"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { toISODate, startOfDay } from "@/lib/dates";
import { useDemo } from "@/lib/store";
import type { RoutineExercise } from "@/lib/types";
import { Button, Card, Empty, Field, Input, Textarea } from "@/components/ui";

const labels = { warmup: "Calentamiento", strength: "Fuerza", cardio: "Cardio" } as const;

function ExerciseLog({
  exercise,
  sets,
  note,
  onSet,
  onNote,
}: {
  exercise: RoutineExercise;
  sets: { setNumber: number; reps: number; weight: number }[];
  note: string;
  onSet: (setNumber: number, field: "reps" | "weight", value: number) => void;
  onNote: (note: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-line bg-white p-3">
      <div>
        <p className="font-medium">{exercise.name}</p>
        <p className="text-xs text-muted">
          Plan: {exercise.sets} × {exercise.reps}
          {exercise.weight != null ? ` @ ${exercise.weight} kg` : ""}
        </p>
        {exercise.coachNotes ? (
          <p className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-950">Coach: {exercise.coachNotes}</p>
        ) : null}
      </div>
      {exercise.section === "strength" ? (
        <div className="space-y-2">
          {Array.from({ length: exercise.sets }, (_, index) => {
            const setNumber = index + 1;
            const row = sets.find((item) => item.setNumber === setNumber);
            return (
              <div key={setNumber} className="grid grid-cols-[2rem_1fr_1fr] items-center gap-2">
                <span className="text-xs text-muted">{setNumber}</span>
                <Input
                  type="number"
                  placeholder="reps"
                  value={row?.reps ?? ""}
                  onChange={(event) => onSet(setNumber, "reps", Number(event.target.value))}
                />
                <Input
                  type="number"
                  placeholder="kg"
                  value={row?.weight ?? ""}
                  onChange={(event) => onSet(setNumber, "weight", Number(event.target.value))}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted">Marca el día como hecho al guardar. Este bloque no pide kilos.</p>
      )}
      <Field label="Tu nota">
        <Textarea value={note} onChange={(event) => onNote(event.target.value)} placeholder="Opcional" />
      </Field>
    </div>
  );
}

export default function LogWorkoutPage({ params }: { params: Promise<{ dayId: string }> }) {
  const { dayId } = use(params);
  const state = useDemo();
  const day = state.trainingDays.find((item) => item.id === dayId);
  const meso = state.mesocycles.find((item) => item.id === day?.mesocycleId);
  const exercises = useMemo(
    () =>
      state.exercises
        .filter((exercise) => exercise.trainingDayId === dayId)
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [state.exercises, dayId],
  );
  const session = state.sessions.find((item) => item.trainingDayId === dayId);

  const initialSets = useMemo(() => {
    const fromLogs = state.setLogs.filter((log) => log.sessionId === session?.id);
    if (fromLogs.length) {
      return fromLogs.map((log) => ({
        exerciseId: log.exerciseId,
        setNumber: log.setNumber,
        reps: log.reps,
        weight: log.weight,
      }));
    }
    return exercises.flatMap((exercise) =>
      exercise.section === "strength"
        ? Array.from({ length: exercise.sets }, (_, index) => ({
            exerciseId: exercise.id,
            setNumber: index + 1,
            reps: Number(String(exercise.reps).match(/\d+/)?.[0] ?? 8),
            weight: exercise.weight ?? 0,
          }))
        : [],
    );
  }, [state.setLogs, session, exercises]);

  const [date, setDate] = useState(session?.date ?? toISODate(startOfDay()));
  const [sets, setSets] = useState(initialSets);
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    state.exerciseNotes
      .filter((note) => note.sessionId === session?.id)
      .forEach((note) => {
        map[note.exerciseId] = note.note;
      });
    return map;
  });
  const [saved, setSaved] = useState(false);

  if (!day) return <Empty title="Día no encontrado" body="Esa rutina no existe." />;

  function updateSet(exerciseId: string, setNumber: number, field: "reps" | "weight", value: number) {
    setSets((current) => {
      const rest = current.filter((item) => !(item.exerciseId === exerciseId && item.setNumber === setNumber));
      const prev = current.find((item) => item.exerciseId === exerciseId && item.setNumber === setNumber);
      return [...rest, { exerciseId, setNumber, reps: prev?.reps ?? 0, weight: prev?.weight ?? 0, [field]: value }];
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/cliente/entrenamiento" className="text-sm text-accent">
          Entrenamiento
        </Link>
        <h1 className="font-display text-4xl italic">
          Día {day.dayNumber} · {day.name}
        </h1>
        <p className="text-muted">
          {meso?.name} · microciclo {day.weekNumber}
        </p>
      </div>

      <Card className="space-y-5">
        <Field label="Fecha en que lo entrenaste">
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
        {(["warmup", "strength", "cardio"] as const).map((section) => {
          const list = exercises.filter((exercise) => exercise.section === section);
          if (!list.length) return null;
          return (
            <div key={section} className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{labels[section]}</p>
              {list.map((exercise) => (
                <ExerciseLog
                  key={exercise.id}
                  exercise={exercise}
                  sets={sets.filter((item) => item.exerciseId === exercise.id)}
                  note={notes[exercise.id] ?? ""}
                  onSet={(setNumber, field, value) => updateSet(exercise.id, setNumber, field, value)}
                  onNote={(note) => setNotes((current) => ({ ...current, [exercise.id]: note }))}
                />
              ))}
            </div>
          );
        })}
        {exercises.length === 0 ? (
          <p className="text-sm text-muted">Tu coach todavía no cargó ejercicios en este día. Podés copiarlos desde el microciclo anterior en la vista coach.</p>
        ) : (
          <Button
            className="w-full"
            onClick={() => {
              state.dispatch({
                type: "SAVE_WORKOUT",
                payload: {
                  trainingDayId: day.id,
                  date,
                  sets: sets.filter((item) => item.reps > 0),
                  notes: Object.entries(notes).map(([exerciseId, note]) => ({ exerciseId, note })),
                },
              });
              setSaved(true);
            }}
          >
            Guardar entrenamiento
          </Button>
        )}
        {saved ? <p className="text-sm text-forest">Guardado. El coach ya ve el volumen y tus notas.</p> : null}
      </Card>
    </div>
  );
}
