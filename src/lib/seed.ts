import { addDays, startOfDay, toISODate } from "./dates";
import { dayId } from "./ids";
import type {
  DailyJournal,
  DemoState,
  ExerciseSection,
  RoutineExercise,
  SetLog,
  TrainingDay,
  WorkoutSession,
} from "./types";

type ExerciseDraft = {
  section: ExerciseSection;
  name: string;
  sets: number;
  reps: string;
  weight: number | null;
  coachNotes: string;
};

function torso(load: number): ExerciseDraft[] {
  return [
    { section: "warmup", name: "Jumping jacks", sets: 2, reps: "45 s", weight: null, coachNotes: "Subir pulso, sin fatiga." },
    { section: "warmup", name: "Dislocaciones de hombro", sets: 2, reps: "12", weight: null, coachNotes: "" },
    { section: "strength", name: "Press banca", sets: 4, reps: "8", weight: 60 + load, coachNotes: "RIR 2. Escápulas juntas." },
    { section: "strength", name: "Remo con barra", sets: 4, reps: "8", weight: 55 + load, coachNotes: "Torso a 45°. Pausa 1 s arriba." },
    { section: "strength", name: "Press militar con mancuernas", sets: 3, reps: "10", weight: 16 + load / 2, coachNotes: "" },
    { section: "strength", name: "Jalón al pecho", sets: 3, reps: "10", weight: 45 + load, coachNotes: "Pecho abierto, sin columpiar." },
    { section: "strength", name: "Vuelos laterales", sets: 3, reps: "12", weight: 6, coachNotes: "No balancear el cuerpo." },
    { section: "cardio", name: "Caminata inclinada", sets: 1, reps: "20 min", weight: null, coachNotes: "Inclinación 8–10. Zona 2." },
  ];
}

function piernas(load: number): ExerciseDraft[] {
  return [
    { section: "warmup", name: "Puente de glúteo", sets: 2, reps: "12", weight: null, coachNotes: "" },
    { section: "warmup", name: "Sentadilla al aire", sets: 2, reps: "10", weight: null, coachNotes: "Calentar el patrón." },
    { section: "strength", name: "Sentadilla trasera", sets: 4, reps: "6-8", weight: 70 + load, coachNotes: "Profundidad completa. Rodillas en línea." },
    { section: "strength", name: "Peso muerto rumano", sets: 3, reps: "8", weight: 70 + load, coachNotes: "Cadera atrás. Lumbar neutra." },
    { section: "strength", name: "Zancadas caminando", sets: 3, reps: "10/lado", weight: 12 + Math.round(load / 4), coachNotes: "" },
    { section: "strength", name: "Hip thrust", sets: 3, reps: "10", weight: 80 + load, coachNotes: "Apretar 2 s arriba." },
    { section: "strength", name: "Elevación de gemelos", sets: 3, reps: "12", weight: 60, coachNotes: "" },
    { section: "cardio", name: "Bicicleta estática", sets: 1, reps: "10 min", weight: null, coachNotes: "Zona 2." },
  ];
}

function parseReps(reps: string): number {
  const match = reps.match(/\d+/);
  return match ? Number(match[0]) : 8;
}

function buildEmptyDays(mesoId: string, dayNames: string[]): TrainingDay[] {
  const days: TrainingDay[] = [];
  for (let week = 1; week <= 12; week += 1) {
    dayNames.forEach((name, index) => {
      days.push({
        id: dayId(mesoId, week, index + 1),
        mesocycleId: mesoId,
        weekNumber: week,
        dayNumber: index + 1,
        name,
      });
    });
  }
  return days;
}

function addExercises(trainingDayId: string, drafts: ExerciseDraft[]): RoutineExercise[] {
  return drafts.map((draft, index) => ({
    id: `${trainingDayId}-ex-${index + 1}`,
    trainingDayId,
    orderIndex: index,
    ...draft,
  }));
}

function logSession(
  trainingDayId: string,
  date: string,
  exercises: RoutineExercise[],
  extras?: { noteExercise?: string; note?: string; loadDelta?: number },
): { session: WorkoutSession; logs: SetLog[]; notes: { sessionId: string; exerciseId: string; note: string }[] } {
  const session: WorkoutSession = {
    id: `ses-${trainingDayId}`,
    trainingDayId,
    date,
  };
  const logs: SetLog[] = [];
  const notes = [];
  const delta = extras?.loadDelta ?? 0;

  for (const exercise of exercises) {
    if (exercise.section !== "strength" || exercise.weight == null) continue;
    const reps = parseReps(exercise.reps);
    for (let setNumber = 1; setNumber <= exercise.sets; setNumber += 1) {
      const lastSetDrop = setNumber === exercise.sets ? -2.5 : 0;
      logs.push({
        id: `${session.id}-${exercise.id}-s${setNumber}`,
        sessionId: session.id,
        exerciseId: exercise.id,
        setNumber,
        reps: setNumber === exercise.sets && reps > 6 ? reps - 1 : reps,
        weight: Math.max(0, exercise.weight + delta + lastSetDrop),
      });
    }
    if (extras?.noteExercise && exercise.name === extras.noteExercise && extras.note) {
      notes.push({ sessionId: session.id, exerciseId: exercise.id, note: extras.note });
    }
  }

  return { session, logs, notes };
}

function journal(date: string, overrides: Partial<DailyJournal>): DailyJournal {
  return {
    date,
    protein: 165,
    carbs: 240,
    fats: 70,
    dietCompliance: 4,
    hunger: 3,
    freeMeals: false,
    dietReason: "",
    trained: true,
    progressedLoads: true,
    hasSoreness: false,
    sorenessMuscles: "",
    hasPain: false,
    painDescription: "",
    steps: 9200,
    didCardio: true,
    performance: 4,
    motivation: 4,
    fatigue: 3,
    stress: 2,
    sleepHours: 7.5,
    sleepQuality: 4,
    ...overrides,
  };
}

export function createSeed(): DemoState {
  const today = startOfDay(new Date());
  const mesoStart = addDays(today, -14);
  const mesoId = "meso-hipertrofia-1";
  const dayNames = ["Torso", "Piernas", "Torso", "Piernas"];

  const trainingDays = buildEmptyDays(mesoId, dayNames);
  const exercises: RoutineExercise[] = [];

  for (const week of [1, 2, 3]) {
    const load = (week - 1) * 2.5;
    for (const dayNumber of [1, 2, 3, 4]) {
      const id = dayId(mesoId, week, dayNumber);
      const template = dayNumber % 2 === 1 ? torso(load) : piernas(load);
      exercises.push(...addExercises(id, template));
    }
  }

  const sessions: WorkoutSession[] = [];
  const setLogs: SetLog[] = [];
  const exerciseNotes: DemoState["exerciseNotes"] = [];

  const logged: Array<{ week: number; day: number; offset: number; extras?: Parameters<typeof logSession>[3] }> = [
    { week: 1, day: 1, offset: 0 },
    { week: 1, day: 2, offset: 1 },
    { week: 1, day: 3, offset: 3 },
    { week: 1, day: 4, offset: 4 },
    { week: 2, day: 1, offset: 7, extras: { noteExercise: "Press banca", note: "Me crujió un poco el hombro derecho en la última serie." } },
    { week: 2, day: 2, offset: 8 },
    { week: 2, day: 3, offset: 10 },
    { week: 2, day: 4, offset: 11 },
  ];

  for (const item of logged) {
    const id = dayId(mesoId, item.week, item.day);
    const dayExercises = exercises.filter((exercise) => exercise.trainingDayId === id);
    const result = logSession(id, toISODate(addDays(mesoStart, item.offset)), dayExercises, item.extras);
    sessions.push(result.session);
    setLogs.push(...result.logs);
    exerciseNotes.push(...result.notes);
  }

  const journals: DailyJournal[] = [];
  for (let i = 9; i >= 1; i -= 1) {
    const date = toISODate(addDays(today, -i));
    const weekend = [0, 6].includes(addDays(today, -i).getDay());
    journals.push(
      journal(date, {
        trained: !weekend || i === 4,
        freeMeals: weekend && i === 2,
        dietCompliance: weekend ? 3 : 4,
        dietReason: weekend && i === 2 ? "Cumpleaños familiar, comí fuera." : "",
        hunger: weekend ? 2 : 3,
        hasSoreness: i === 8 || i === 7,
        sorenessMuscles: i === 8 ? "Pectoral y deltoides" : i === 7 ? "Cuádriceps" : "",
        steps: 7800 + i * 180,
        sleepHours: 6.5 + (i % 3) * 0.5,
        motivation: i === 3 ? 2 : 4,
        fatigue: i === 3 ? 4 : 3,
      }),
    );
  }

  return {
    role: "coach",
    client: {
      id: "client-juan",
      name: "Juan Pérez",
      email: "juan.perez@email.com",
    },
    mesocycles: [
      {
        id: mesoId,
        name: "Hipertrofia · bloque 1",
        startDate: toISODate(mesoStart),
        trainingDaysPerWeek: 4,
        calorieTarget: 2400,
        status: "active",
        feedbackEnabled: false,
      },
    ],
    trainingDays,
    exercises,
    sessions,
    setLogs,
    exerciseNotes,
    journals,
    measurementFields: [
      { id: "mf-peso", label: "Peso", unit: "kg", type: "number", required: true },
      { id: "mf-cintura", label: "Cintura", unit: "cm", type: "number", required: true },
      { id: "mf-cadera", label: "Cadera", unit: "cm", type: "number", required: false },
      { id: "mf-pecho", label: "Pecho", unit: "cm", type: "number", required: false },
      { id: "mf-frente", label: "Foto frente", unit: "", type: "photo", required: true },
      { id: "mf-lateral", label: "Foto lateral", unit: "", type: "photo", required: true },
    ],
    measurementEntries: [
      {
        id: "me-inicio",
        date: toISODate(mesoStart),
        values: {
          "mf-peso": 86.2,
          "mf-cintura": 94,
          "mf-cadera": 102,
          "mf-pecho": 108,
          "mf-frente": null,
          "mf-lateral": null,
        },
      },
      {
        id: "me-reciente",
        date: toISODate(addDays(today, -2)),
        values: {
          "mf-peso": 85.1,
          "mf-cintura": 92.5,
          "mf-cadera": 101,
          "mf-pecho": 108.5,
          "mf-frente": null,
          "mf-lateral": null,
        },
      },
    ],
    feedbackForms: [],
    feedbackResponses: [],
  };
}
