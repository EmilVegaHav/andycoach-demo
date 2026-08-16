"use client";

import { useState } from "react";
import { formatShort, toISODate, startOfDay } from "@/lib/dates";
import { useDemo } from "@/lib/store";
import type { FieldType } from "@/lib/types";
import { Button, Card, Empty, Field, Input, Select } from "@/components/ui";

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 700_000) {
      reject(new Error("La foto debe pesar menos de 700 KB en este demo."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

export function MeasurementsPage({ role }: { role: "coach" | "client" }) {
  const state = useDemo();
  const [date, setDate] = useState(toISODate(startOfDay()));
  const existing = state.measurementEntries.find((entry) => entry.date === date);
  const [values, setValues] = useState<Record<string, number | string | null>>(existing?.values ?? {});
  const [error, setError] = useState("");

  function setValue(id: string, value: number | string | null) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{role === "coach" ? "Coach" : "Cliente"}</p>
        <h1 className="font-display text-4xl italic">Medidas y fotos</h1>
      </div>

      {role === "coach" ? (
        <Card className="space-y-4">
          <h2 className="font-medium">Campos que pedís al cliente</h2>
          <ul className="space-y-2">
            {state.measurementFields.map((field) => (
              <li key={field.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white p-2">
                <Input
                  className="max-w-40"
                  value={field.label}
                  onChange={(event) =>
                    state.dispatch({
                      type: "UPDATE_MEASUREMENT_FIELD",
                      id: field.id,
                      patch: { label: event.target.value },
                    })
                  }
                />
                {field.type === "number" ? (
                  <Input
                    className="max-w-20"
                    value={field.unit}
                    onChange={(event) =>
                      state.dispatch({
                        type: "UPDATE_MEASUREMENT_FIELD",
                        id: field.id,
                        patch: { unit: event.target.value },
                      })
                    }
                  />
                ) : (
                  <span className="text-xs text-muted">Foto</span>
                )}
                <button
                  className="ml-auto text-sm text-muted hover:text-red-700"
                  onClick={() => state.dispatch({ type: "DELETE_MEASUREMENT_FIELD", id: field.id })}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              state.dispatch({
                type: "ADD_MEASUREMENT_FIELD",
                field: {
                  label: String(data.get("label")),
                  unit: String(data.get("unit") || ""),
                  type: String(data.get("type")) as FieldType,
                  required: true,
                },
              });
              event.currentTarget.reset();
            }}
          >
            <Input name="label" placeholder="Ej. Muñeca" required />
            <Input name="unit" placeholder="cm" />
            <Select name="type" defaultValue="number">
              <option value="number">Número</option>
              <option value="photo">Foto</option>
            </Select>
            <Button type="submit">Agregar campo</Button>
          </form>
        </Card>
      ) : null}

      <Card className="space-y-4">
        <h2 className="font-medium">{role === "coach" ? "Historial" : "Nueva toma"}</h2>
        {role === "client" ? (
          <>
            <Field label="Fecha">
              <Input
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  const found = state.measurementEntries.find((entry) => entry.date === event.target.value);
                  setValues(found?.values ?? {});
                }}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              {state.measurementFields.map((field) => (
                <Field key={field.id} label={`${field.label}${field.unit ? ` (${field.unit})` : ""}`}>
                  {field.type === "number" ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={typeof values[field.id] === "number" ? String(values[field.id]) : ""}
                      onChange={(event) =>
                        setValue(field.id, event.target.value ? Number(event.target.value) : null)
                      }
                    />
                  ) : (
                    <div className="space-y-2">
                      {typeof values[field.id] === "string" && values[field.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={String(values[field.id])} alt={field.label} className="h-32 rounded-lg object-cover" />
                      ) : null}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          try {
                            setError("");
                            setValue(field.id, await readFile(file));
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Error al subir");
                          }
                        }}
                      />
                    </div>
                  )}
                </Field>
              ))}
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button
              onClick={() =>
                state.dispatch({ type: "SAVE_MEASUREMENT_ENTRY", entry: { date, values } })
              }
            >
              Guardar medidas
            </Button>
          </>
        ) : state.measurementEntries.length === 0 ? (
          <Empty title="Sin tomas" body="Cuando el cliente suba medidas o fotos, aparecen acá." />
        ) : (
          <div className="space-y-6">
            {[...state.measurementEntries].reverse().map((entry) => (
              <div key={entry.id} className="rounded-xl border border-line bg-white p-4">
                <p className="mb-3 font-medium">{formatShort(entry.date)}</p>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {state.measurementFields.map((field) => (
                    <div key={field.id}>
                      <dt className="text-muted">{field.label}</dt>
                      <dd>
                        {field.type === "photo" ? (
                          typeof entry.values[field.id] === "string" && entry.values[field.id] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={String(entry.values[field.id])}
                              alt={field.label}
                              className="mt-1 h-28 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="text-muted">Sin foto</span>
                          )
                        ) : (
                          <>
                            {entry.values[field.id] ?? "—"} {field.unit}
                          </>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
