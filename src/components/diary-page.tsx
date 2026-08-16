"use client";

import { useMemo, useState } from "react";
import { addDays, formatLong, startOfDay, toISODate } from "@/lib/dates";
import { useScopedDemo } from "@/lib/store";
import { JournalForm } from "@/components/journal-form";
import { Card, cn } from "@/components/ui";

export function DiaryPage({ readOnly }: { readOnly: boolean }) {
  const state = useScopedDemo();
  const today = toISODate(startOfDay());
  const [date, setDate] = useState(today);
  const meso = state.mesocycles.find((item) => item.status === "active") ?? state.mesocycles[0];
  const dates = useMemo(() => Array.from({ length: 14 }, (_, i) => toISODate(addDays(startOfDay(), i - 13))), []);
  const entry = state.journals.find((item) => item.date === date);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{readOnly ? "Coach" : "Cliente"}</p>
        <h1 className="font-display text-4xl italic">Diario</h1>
        <p className="text-muted">
          {readOnly ? `${state.client.name} · ` : ""}
          {formatLong(date)}
        </p>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {dates.map((item) => {
          const has = state.journals.some((journal) => journal.date === item);
          return (
            <button
              key={item}
              onClick={() => setDate(item)}
              className={cn(
                "min-w-12 rounded-xl px-2 py-2 text-center text-xs",
                item === date ? "bg-ink text-paper" : "bg-white text-muted",
              )}
            >
              {item.slice(8)}
              {has ? <span className="mt-0.5 block h-1 w-1 mx-auto rounded-full bg-accent" /> : null}
            </button>
          );
        })}
      </div>
      <Card>
        {readOnly && !entry ? (
          <p className="text-sm text-muted">{state.client.name} no registró este día todavía.</p>
        ) : (
          <JournalForm
            key={date}
            date={date}
            calorieTarget={meso?.calorieTarget}
            initial={entry ?? undefined}
            readOnly={readOnly}
            onSave={(next) =>
              state.dispatch({ type: "SAVE_JOURNAL", entry: { ...next, date, clientId: state.client.id } })
            }
          />
        )}
      </Card>
    </div>
  );
}
