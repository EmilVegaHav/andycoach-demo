"use client";

import { useState } from "react";
import { useScopedDemo } from "@/lib/store";
import { toISODate, startOfDay } from "@/lib/dates";
import { Button, Card, Empty, Field, Input, Scale, Textarea, YesNo } from "@/components/ui";

export default function ClientFeedback() {
  const state = useScopedDemo();
  const meso = state.mesocycles.find(
    (item) => item.feedbackEnabled || item.status === "completed",
  );
  const form = meso ? state.feedbackForms.find((item) => item.mesocycleId === meso.id) : undefined;
  const existing = meso ? state.feedbackResponses.find((item) => item.mesocycleId === meso.id) : undefined;
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>(existing?.answers ?? {});
  const [done, setDone] = useState(Boolean(existing));

  if (!meso || !meso.feedbackEnabled) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl italic">Feedback</h1>
        <Empty
          title="Todavía no está habilitado"
          body="Al cerrar el mesociclo, tu coach habilita este formulario. En el demo, el coach puede pulsar «Habilitar al cliente»."
        />
      </div>
    );
  }

  if (!form || form.fields.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl italic">Feedback</h1>
        <Empty title="Sin preguntas" body="El coach todavía no armó las preguntas del cierre." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-4xl italic">Feedback</h1>
        <p className="text-muted">{meso.name}</p>
      </div>
      <Card className="space-y-4">
        {form.fields.map((field) => (
          <Field key={field.id} label={field.label}>
            {field.type === "text" ? (
              <Input
                value={String(answers[field.id] ?? "")}
                onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))}
              />
            ) : null}
            {field.type === "textarea" ? (
              <Textarea
                value={String(answers[field.id] ?? "")}
                onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))}
              />
            ) : null}
            {field.type === "scale" ? (
              <Scale
                value={typeof answers[field.id] === "number" ? Number(answers[field.id]) : 3}
                onChange={(value) => setAnswers((current) => ({ ...current, [field.id]: value }))}
              />
            ) : null}
            {field.type === "yesno" ? (
              <YesNo
                value={Boolean(answers[field.id])}
                onChange={(value) => setAnswers((current) => ({ ...current, [field.id]: value }))}
              />
            ) : null}
          </Field>
        ))}
        <Button
          onClick={() => {
            state.dispatch({
              type: "SAVE_FEEDBACK_RESPONSE",
              response: { mesocycleId: meso.id, answers, submittedAt: toISODate(startOfDay()) },
            });
            setDone(true);
          }}
        >
          Enviar
        </Button>
        {done ? <p className="text-sm text-forest">Enviado. El coach lo ve en el mesociclo.</p> : null}
      </Card>
    </div>
  );
}
