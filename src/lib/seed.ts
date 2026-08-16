import { addDays, startOfDay, toISODate } from "./dates";
import { dayId } from "./ids";
import { LOGGED_CLIENT_ID } from "./types";
import type {
  DailyJournal,
  DemoState,
  ExerciseSection,
  MeasurementEntry,
  MeasurementField,
  Mesocycle,
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

function journal(clientId: string, date: string, overrides: Partial<DailyJournal> = {}): DailyJournal {
  return {
    clientId,
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

function measurementSet(clientId: string): MeasurementField[] {
  return [
    { id: `${clientId}-mf-peso`, label: "Peso", unit: "kg", type: "number", required: true, clientId },
    { id: `${clientId}-mf-cintura`, label: "Cintura", unit: "cm", type: "number", required: true, clientId },
    { id: `${clientId}-mf-cadera`, label: "Cadera", unit: "cm", type: "number", required: false, clientId },
    { id: `${clientId}-mf-pecho`, label: "Pecho", unit: "cm", type: "number", required: false, clientId },
    { id: `${clientId}-mf-frente`, label: "Foto frente", unit: "", type: "photo", required: true, clientId },
    { id: `${clientId}-mf-lateral`, label: "Foto lateral", unit: "", type: "photo", required: true, clientId },
  ];
}

type ProgramInput = {
  clientId: string;
  mesoId: string;
  mesoName: string;
  startOffsetDays: number;
  calorieTarget: number;
  dayNames: string[];
  templateWeeks: number;
  templateForDay: (dayNumber: number, load: number) => ExerciseDraft[];
  logged: Array<{ week: number; day: number; offset: number; extras?: Parameters<typeof logSession>[3] }>;
  journals: DailyJournal[];
  entries: MeasurementEntry[];
};

function buildProgram(input: ProgramInput, today: Date) {
  const mesoStart = addDays(today, input.startOffsetDays);
  const mesocycle: Mesocycle = {
    id: input.mesoId,
    clientId: input.clientId,
    name: input.mesoName,
    startDate: toISODate(mesoStart),
    trainingDaysPerWeek: input.dayNames.length,
    calorieTarget: input.calorieTarget,
    status: "active",
    feedbackEnabled: false,
  };
  const trainingDays = buildEmptyDays(input.mesoId, input.dayNames);
  const exercises: RoutineExercise[] = [];
  for (let week = 1; week <= input.templateWeeks; week += 1) {
    const load = (week - 1) * 2.5;
    input.dayNames.forEach((_, index) => {
      const dayNumber = index + 1;
      exercises.push(...addExercises(dayId(input.mesoId, week, dayNumber), input.templateForDay(dayNumber, load)));
    });
  }
  const sessions: WorkoutSession[] = [];
  const setLogs: SetLog[] = [];
  const exerciseNotes: DemoState["exerciseNotes"] = [];
  for (const item of input.logged) {
    const id = dayId(input.mesoId, item.week, item.day);
    const result = logSession(
      id,
      toISODate(addDays(mesoStart, item.offset)),
      exercises.filter((exercise) => exercise.trainingDayId === id),
      item.extras,
    );
    sessions.push(result.session);
    setLogs.push(...result.logs);
    exerciseNotes.push(...result.notes);
  }
  return { mesocycle, trainingDays, exercises, sessions, setLogs, exerciseNotes, journals: input.journals, entries: input.entries };
}

export function createSeed(): DemoState {
  const today = startOfDay(new Date());
  const juanId = LOGGED_CLIENT_ID;
  const anaId = "client-ana";

  const juan = buildProgram(
    {
      clientId: juanId,
      mesoId: "meso-juan-hipertrofia-1",
      mesoName: "Hipertrofia · bloque 1",
      startOffsetDays: -14,
      calorieTarget: 2400,
      dayNames: ["Torso", "Piernas", "Torso", "Piernas"],
      templateWeeks: 3,
      templateForDay: (day, load) => (day % 2 === 1 ? torso(load) : piernas(load)),
      logged: [
        { week: 1, day: 1, offset: 0 },
        { week: 1, day: 2, offset: 1 },
        { week: 1, day: 3, offset: 3 },
        { week: 1, day: 4, offset: 4 },
        { week: 2, day: 1, offset: 7, extras: { noteExercise: "Press banca", note: "Me crujió un poco el hombro derecho en la última serie." } },
        { week: 2, day: 2, offset: 8 },
        { week: 2, day: 3, offset: 10 },
        { week: 2, day: 4, offset: 11 },
      ],
      journals: Array.from({ length: 9 }, (_, idx) => {
        const i = 9 - idx;
        const date = toISODate(addDays(today, -i));
        const weekend = [0, 6].includes(addDays(today, -i).getDay());
        return journal(juanId, date, {
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
        });
      }),
      entries: [
        {
          id: "me-juan-inicio",
          clientId: juanId,
          date: toISODate(addDays(today, -14)),
          values: { [`${juanId}-mf-peso`]: 86.2, [`${juanId}-mf-cintura`]: 94, [`${juanId}-mf-cadera`]: 102, [`${juanId}-mf-pecho`]: 108, [`${juanId}-mf-frente`]: null, [`${juanId}-mf-lateral`]: null },
        },
        {
          id: "me-juan-reciente",
          clientId: juanId,
          date: toISODate(addDays(today, -2)),
          values: { [`${juanId}-mf-peso`]: 85.1, [`${juanId}-mf-cintura`]: 92.5, [`${juanId}-mf-cadera`]: 101, [`${juanId}-mf-pecho`]: 108.5, [`${juanId}-mf-frente`]: null, [`${juanId}-mf-lateral`]: null },
        },
      ],
    },
    today,
  );

  const ana = buildProgram(
    {
      clientId: anaId,
      mesoId: "meso-ana-recomp-1",
      mesoName: "Recomposición · bloque 1",
      startOffsetDays: -7,
      calorieTarget: 1900,
      dayNames: ["Empuje", "Tirón", "Piernas"],
      templateWeeks: 2,
      templateForDay: (day, load) => {
        if (day === 3) return piernas(load - 20);
        return torso(load - 20);
      },
      logged: [
        { week: 1, day: 1, offset: 0 },
        { week: 1, day: 2, offset: 2 },
        { week: 1, day: 3, offset: 4, extras: { noteExercise: "Sentadilla trasera", note: "Profundo bien, pero me temblaron las piernas en la última." } },
      ],
      journals: Array.from({ length: 6 }, (_, idx) => {
        const i = 6 - idx;
        const date = toISODate(addDays(today, -i));
        return journal(anaId, date, {
          protein: 130,
          carbs: 180,
          fats: 55,
          dietCompliance: i === 2 ? 2 : 5,
          dietReason: i === 2 ? "Viaje de trabajo, comí en restaurante." : "",
          trained: i !== 3,
          steps: 10000 + i * 120,
          sleepHours: 7 + (i % 2) * 0.5,
          stress: i === 2 ? 4 : 2,
          motivation: 5,
          hunger: 2,
        });
      }),
      entries: [
        {
          id: "me-ana-inicio",
          clientId: anaId,
          date: toISODate(addDays(today, -7)),
          values: { [`${anaId}-mf-peso`]: 68.4, [`${anaId}-mf-cintura`]: 74, [`${anaId}-mf-cadera`]: 98, [`${anaId}-mf-pecho`]: 92, [`${anaId}-mf-frente`]: null, [`${anaId}-mf-lateral`]: null },
        },
        {
          id: "me-ana-reciente",
          clientId: anaId,
          date: toISODate(addDays(today, -1)),
          values: { [`${anaId}-mf-peso`]: 67.9, [`${anaId}-mf-cintura`]: 73.5, [`${anaId}-mf-cadera`]: 97.5, [`${anaId}-mf-pecho`]: 92, [`${anaId}-mf-frente`]: null, [`${anaId}-mf-lateral`]: null },
        },
      ],
    },
    today,
  );

  return {
    loggedIn: false,
    role: "coach",
    selectedClientId: juanId,
    clients: [
      { id: juanId, name: "Juan Pérez", email: "juan.perez@email.com" },
      { id: anaId, name: "Ana Gómez", email: "ana.gomez@email.com" },
    ],
    mesocycles: [juan.mesocycle, ana.mesocycle],
    trainingDays: [...juan.trainingDays, ...ana.trainingDays],
    exercises: [...juan.exercises, ...ana.exercises],
    sessions: [...juan.sessions, ...ana.sessions],
    setLogs: [...juan.setLogs, ...ana.setLogs],
    exerciseNotes: [...juan.exerciseNotes, ...ana.exerciseNotes],
    journals: [...juan.journals, ...ana.journals],
    measurementFields: [...measurementSet(juanId), ...measurementSet(anaId)],
    measurementEntries: [...juan.entries, ...ana.entries],
    feedbackForms: [],
    feedbackResponses: [],
  };
}
