"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { dayId, defaultDayNames, uid } from "./ids";
import { createSeed } from "./seed";
import type {
  DailyJournal,
  DemoState,
  ExerciseSection,
  FeedbackForm,
  FeedbackResponse,
  MeasurementEntry,
  MeasurementField,
  Mesocycle,
  Role,
  RoutineExercise,
} from "./types";

const STORAGE_KEY = "andy-coach-demo-v1";

type Action =
  | { type: "HYDRATE"; state: DemoState }
  | { type: "RESET" }
  | { type: "SET_ROLE"; role: Role }
  | {
      type: "CREATE_MESOCYCLE";
      payload: Pick<Mesocycle, "name" | "startDate" | "trainingDaysPerWeek" | "calorieTarget" | "status"> & {
        dayNames: string[];
      };
    }
  | { type: "UPDATE_MESOCYCLE"; id: string; patch: Partial<Mesocycle> }
  | { type: "DELETE_MESOCYCLE"; id: string }
  | { type: "SET_DAY_NAME"; id: string; name: string }
  | {
      type: "ADD_EXERCISE";
      payload: {
        trainingDayId: string;
        section: ExerciseSection;
        name: string;
        sets: number;
        reps: string;
        weight: number | null;
        coachNotes: string;
      };
    }
  | { type: "UPDATE_EXERCISE"; id: string; patch: Partial<RoutineExercise> }
  | { type: "DELETE_EXERCISE"; id: string }
  | { type: "COPY_WEEK"; mesocycleId: string; fromWeek: number; toWeek: number }
  | {
      type: "SAVE_WORKOUT";
      payload: {
        trainingDayId: string;
        date: string;
        sets: { exerciseId: string; setNumber: number; reps: number; weight: number }[];
        notes: { exerciseId: string; note: string }[];
      };
    }
  | { type: "SAVE_JOURNAL"; entry: DailyJournal }
  | { type: "ADD_MEASUREMENT_FIELD"; field: Omit<MeasurementField, "id"> }
  | { type: "UPDATE_MEASUREMENT_FIELD"; id: string; patch: Partial<MeasurementField> }
  | { type: "DELETE_MEASUREMENT_FIELD"; id: string }
  | { type: "SAVE_MEASUREMENT_ENTRY"; entry: Omit<MeasurementEntry, "id"> & { id?: string } }
  | { type: "SAVE_FEEDBACK_FORM"; form: FeedbackForm }
  | { type: "SAVE_FEEDBACK_RESPONSE"; response: FeedbackResponse };

function buildDays(mesocycleId: string, dayNames: string[]) {
  return Array.from({ length: 12 }, (_, week) =>
    dayNames.map((name, index) => ({
      id: dayId(mesocycleId, week + 1, index + 1),
      mesocycleId,
      weekNumber: week + 1,
      dayNumber: index + 1,
      name,
    })),
  ).flat();
}

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "RESET":
      return createSeed();
    case "SET_ROLE":
      return { ...state, role: action.role };
    case "CREATE_MESOCYCLE": {
      const id = uid("meso");
      const names =
        action.payload.dayNames.length === action.payload.trainingDaysPerWeek
          ? action.payload.dayNames
          : defaultDayNames(action.payload.trainingDaysPerWeek);
      const mesocycle: Mesocycle = {
        id,
        name: action.payload.name,
        startDate: action.payload.startDate,
        trainingDaysPerWeek: action.payload.trainingDaysPerWeek,
        calorieTarget: action.payload.calorieTarget,
        status: action.payload.status,
        feedbackEnabled: false,
      };
      return {
        ...state,
        mesocycles: [...state.mesocycles, mesocycle],
        trainingDays: [...state.trainingDays, ...buildDays(id, names)],
      };
    }
    case "UPDATE_MESOCYCLE":
      return {
        ...state,
        mesocycles: state.mesocycles.map((item) =>
          item.id === action.id ? { ...item, ...action.patch } : item,
        ),
      };
    case "DELETE_MESOCYCLE": {
      const dayIds = new Set(
        state.trainingDays.filter((day) => day.mesocycleId === action.id).map((day) => day.id),
      );
      const sessionIds = new Set(
        state.sessions.filter((session) => dayIds.has(session.trainingDayId)).map((session) => session.id),
      );
      return {
        ...state,
        mesocycles: state.mesocycles.filter((item) => item.id !== action.id),
        trainingDays: state.trainingDays.filter((day) => day.mesocycleId !== action.id),
        exercises: state.exercises.filter((exercise) => !dayIds.has(exercise.trainingDayId)),
        sessions: state.sessions.filter((session) => !dayIds.has(session.trainingDayId)),
        setLogs: state.setLogs.filter((log) => !sessionIds.has(log.sessionId)),
        exerciseNotes: state.exerciseNotes.filter((note) => !sessionIds.has(note.sessionId)),
        feedbackForms: state.feedbackForms.filter((form) => form.mesocycleId !== action.id),
        feedbackResponses: state.feedbackResponses.filter((item) => item.mesocycleId !== action.id),
      };
    }
    case "SET_DAY_NAME": {
      const day = state.trainingDays.find((item) => item.id === action.id);
      if (!day) return state;
      return {
        ...state,
        trainingDays: state.trainingDays.map((item) =>
          item.mesocycleId === day.mesocycleId && item.dayNumber === day.dayNumber
            ? { ...item, name: action.name }
            : item,
        ),
      };
    }
    case "ADD_EXERCISE": {
      const count = state.exercises.filter(
        (exercise) => exercise.trainingDayId === action.payload.trainingDayId,
      ).length;
      const exercise: RoutineExercise = {
        id: uid("ex"),
        orderIndex: count,
        ...action.payload,
      };
      return { ...state, exercises: [...state.exercises, exercise] };
    }
    case "UPDATE_EXERCISE":
      return {
        ...state,
        exercises: state.exercises.map((exercise) =>
          exercise.id === action.id ? { ...exercise, ...action.patch } : exercise,
        ),
      };
    case "DELETE_EXERCISE":
      return {
        ...state,
        exercises: state.exercises.filter((exercise) => exercise.id !== action.id),
        setLogs: state.setLogs.filter((log) => log.exerciseId !== action.id),
        exerciseNotes: state.exerciseNotes.filter((note) => note.exerciseId !== action.id),
      };
    case "COPY_WEEK": {
      const fromDays = state.trainingDays.filter(
        (day) => day.mesocycleId === action.mesocycleId && day.weekNumber === action.fromWeek,
      );
      const toDays = state.trainingDays.filter(
        (day) => day.mesocycleId === action.mesocycleId && day.weekNumber === action.toWeek,
      );
      const toIds = new Set(toDays.map((day) => day.id));
      const copied = fromDays.flatMap((fromDay) => {
        const target = toDays.find((day) => day.dayNumber === fromDay.dayNumber);
        if (!target) return [];
        return state.exercises
          .filter((exercise) => exercise.trainingDayId === fromDay.id)
          .map((exercise) => ({
            ...exercise,
            id: uid("ex"),
            trainingDayId: target.id,
          }));
      });
      return {
        ...state,
        trainingDays: state.trainingDays.map((day) => {
          if (!toIds.has(day.id)) return day;
          const source = fromDays.find((item) => item.dayNumber === day.dayNumber);
          return source ? { ...day, name: source.name } : day;
        }),
        exercises: [
          ...state.exercises.filter((exercise) => !toIds.has(exercise.trainingDayId)),
          ...copied,
        ],
      };
    }
    case "SAVE_WORKOUT": {
      const existing = state.sessions.find(
        (session) => session.trainingDayId === action.payload.trainingDayId,
      );
      const sessionId = existing?.id ?? uid("ses");
      const session = {
        id: sessionId,
        trainingDayId: action.payload.trainingDayId,
        date: action.payload.date,
      };
      return {
        ...state,
        sessions: [
          ...state.sessions.filter((item) => item.trainingDayId !== action.payload.trainingDayId),
          session,
        ],
        setLogs: [
          ...state.setLogs.filter((log) => log.sessionId !== sessionId),
          ...action.payload.sets.map((set) => ({
            id: uid("set"),
            sessionId,
            ...set,
          })),
        ],
        exerciseNotes: [
          ...state.exerciseNotes.filter((note) => note.sessionId !== sessionId),
          ...action.payload.notes
            .filter((note) => note.note.trim())
            .map((note) => ({ sessionId, ...note })),
        ],
      };
    }
    case "SAVE_JOURNAL":
      return {
        ...state,
        journals: [
          ...state.journals.filter((item) => item.date !== action.entry.date),
          action.entry,
        ].sort((a, b) => a.date.localeCompare(b.date)),
      };
    case "ADD_MEASUREMENT_FIELD":
      return {
        ...state,
        measurementFields: [...state.measurementFields, { id: uid("mf"), ...action.field }],
      };
    case "UPDATE_MEASUREMENT_FIELD":
      return {
        ...state,
        measurementFields: state.measurementFields.map((field) =>
          field.id === action.id ? { ...field, ...action.patch } : field,
        ),
      };
    case "DELETE_MEASUREMENT_FIELD":
      return {
        ...state,
        measurementFields: state.measurementFields.filter((field) => field.id !== action.id),
      };
    case "SAVE_MEASUREMENT_ENTRY": {
      const id = action.entry.id ?? uid("me");
      const next = { id, date: action.entry.date, values: action.entry.values };
      return {
        ...state,
        measurementEntries: [
          ...state.measurementEntries.filter((item) => item.id !== id && item.date !== next.date),
          next,
        ].sort((a, b) => a.date.localeCompare(b.date)),
      };
    }
    case "SAVE_FEEDBACK_FORM":
      return {
        ...state,
        feedbackForms: [
          ...state.feedbackForms.filter((form) => form.mesocycleId !== action.form.mesocycleId),
          action.form,
        ],
      };
    case "SAVE_FEEDBACK_RESPONSE":
      return {
        ...state,
        feedbackResponses: [
          ...state.feedbackResponses.filter((item) => item.mesocycleId !== action.response.mesocycleId),
          action.response,
        ],
      };
    default:
      return state;
  }
}

type DemoContextValue = DemoState & {
  ready: boolean;
  dispatch: React.Dispatch<Action>;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, createSeed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) as DemoState });
    } catch {
      /* seed already applied */
    }
    // Hydration from localStorage: show the app only after the client snapshot exists.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- required before painting demo data
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const value = useMemo(() => ({ ...state, ready, dispatch }), [state, ready]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}
