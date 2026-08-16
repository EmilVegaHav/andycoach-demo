"use client";

import { useState } from "react";
import { macrosToCalories } from "@/lib/volume";
import type { DailyJournal } from "@/lib/types";
import { Button, Field, Input, Scale, Textarea, YesNo } from "@/components/ui";

const empty = (date: string, defaults?: Partial<DailyJournal>): DailyJournal => ({
  date,
  protein: null,
  carbs: null,
  fats: null,
  dietCompliance: 3,
  hunger: 3,
  freeMeals: false,
  dietReason: "",
  trained: false,
  progressedLoads: false,
  hasSoreness: false,
  sorenessMuscles: "",
  hasPain: false,
  painDescription: "",
  steps: null,
  didCardio: false,
  performance: 3,
  motivation: 3,
  fatigue: 3,
  stress: 3,
  sleepHours: null,
  sleepQuality: 3,
  ...defaults,
});

export function JournalForm({
  date,
  calorieTarget,
  initial,
  readOnly,
  onSave,
}: {
  date: string;
  calorieTarget?: number;
  initial?: DailyJournal;
  readOnly?: boolean;
  onSave?: (entry: DailyJournal) => void;
}) {
  const [entry, setEntry] = useState<DailyJournal>(initial ?? empty(date));
  const calories = macrosToCalories(entry.protein, entry.carbs, entry.fats);

  function set<K extends keyof DailyJournal>(key: K, value: DailyJournal[K]) {
    setEntry((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSave?.(entry);
      }}
    >
      <div className="rounded-xl bg-paper px-4 py-3 text-sm">
        Objetivo del coach: <strong>{calorieTarget ?? "—"} kcal</strong>
        {calories != null ? ` · registradas ${calories} kcal (macros)` : ""}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Proteína (g)">
          <Input
            type="number"
            disabled={readOnly}
            value={entry.protein ?? ""}
            onChange={(event) => set("protein", event.target.value ? Number(event.target.value) : null)}
          />
        </Field>
        <Field label="Carbohidratos (g)">
          <Input
            type="number"
            disabled={readOnly}
            value={entry.carbs ?? ""}
            onChange={(event) => set("carbs", event.target.value ? Number(event.target.value) : null)}
          />
        </Field>
        <Field label="Grasas (g)">
          <Input
            type="number"
            disabled={readOnly}
            value={entry.fats ?? ""}
            onChange={(event) => set("fats", event.target.value ? Number(event.target.value) : null)}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cumplió la dieta">
          <Scale value={entry.dietCompliance} disabled={readOnly} onChange={(value) => set("dietCompliance", value)} />
        </Field>
        <Field label="Hambre">
          <Scale value={entry.hunger} disabled={readOnly} onChange={(value) => set("hunger", value)} />
        </Field>
        <Field label="Comidas libres">
          <YesNo value={entry.freeMeals} disabled={readOnly} onChange={(value) => set("freeMeals", value)} />
        </Field>
        <Field label="¿Entrenó?">
          <YesNo value={entry.trained} disabled={readOnly} onChange={(value) => set("trained", value)} />
        </Field>
        <Field label="¿Progresó cargas?">
          <YesNo value={entry.progressedLoads} disabled={readOnly} onChange={(value) => set("progressedLoads", value)} />
        </Field>
        <Field label="¿Hizo cardio?">
          <YesNo value={entry.didCardio} disabled={readOnly} onChange={(value) => set("didCardio", value)} />
        </Field>
      </div>
      <Field label="Si no cumplió la dieta, ¿por qué?">
        <Textarea
          disabled={readOnly}
          value={entry.dietReason}
          onChange={(event) => set("dietReason", event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="¿Agujetas?">
          <YesNo value={entry.hasSoreness} disabled={readOnly} onChange={(value) => set("hasSoreness", value)} />
        </Field>
        <Field label="Músculos con agujetas">
          <Input
            disabled={readOnly || !entry.hasSoreness}
            value={entry.sorenessMuscles}
            onChange={(event) => set("sorenessMuscles", event.target.value)}
          />
        </Field>
        <Field label="¿Dolor?">
          <YesNo value={entry.hasPain} disabled={readOnly} onChange={(value) => set("hasPain", value)} />
        </Field>
        <Field label="Dónde / cómo">
          <Input
            disabled={readOnly || !entry.hasPain}
            value={entry.painDescription}
            onChange={(event) => set("painDescription", event.target.value)}
          />
        </Field>
      </div>
      <Field label="Pasos">
        <Input
          type="number"
          disabled={readOnly}
          value={entry.steps ?? ""}
          onChange={(event) => set("steps", event.target.value ? Number(event.target.value) : null)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Rendimiento">
          <Scale value={entry.performance} disabled={readOnly} onChange={(value) => set("performance", value)} />
        </Field>
        <Field label="Motivación">
          <Scale value={entry.motivation} disabled={readOnly} onChange={(value) => set("motivation", value)} />
        </Field>
        <Field label="Cansancio">
          <Scale value={entry.fatigue} disabled={readOnly} onChange={(value) => set("fatigue", value)} />
        </Field>
        <Field label="Estrés">
          <Scale value={entry.stress} disabled={readOnly} onChange={(value) => set("stress", value)} />
        </Field>
        <Field label="Horas de sueño">
          <Input
            type="number"
            step="0.5"
            disabled={readOnly}
            value={entry.sleepHours ?? ""}
            onChange={(event) => set("sleepHours", event.target.value ? Number(event.target.value) : null)}
          />
        </Field>
        <Field label="Calidad de sueño">
          <Scale value={entry.sleepQuality} disabled={readOnly} onChange={(value) => set("sleepQuality", value)} />
        </Field>
      </div>
      {readOnly ? null : (
        <Button type="submit" className="w-full sm:w-auto">
          Guardar diario
        </Button>
      )}
    </form>
  );
}
