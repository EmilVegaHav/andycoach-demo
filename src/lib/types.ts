export type Role = "coach" | "client";

export type MesoStatus = "draft" | "active" | "completed";

export type ExerciseSection = "warmup" | "strength" | "cardio";

export type FieldType = "number" | "photo";

export type FeedbackFieldType = "text" | "textarea" | "scale" | "yesno";

export type ClientProfile = {
  id: string;
  name: string;
  email: string;
};

export type Mesocycle = {
  id: string;
  clientId: string;
  name: string;
  startDate: string;
  trainingDaysPerWeek: number;
  calorieTarget: number;
  status: MesoStatus;
  feedbackEnabled: boolean;
};

export type TrainingDay = {
  id: string;
  mesocycleId: string;
  weekNumber: number;
  dayNumber: number;
  name: string;
};

export type RoutineExercise = {
  id: string;
  trainingDayId: string;
  section: ExerciseSection;
  name: string;
  orderIndex: number;
  sets: number;
  reps: string;
  weight: number | null;
  coachNotes: string;
};

export type WorkoutSession = {
  id: string;
  trainingDayId: string;
  date: string;
};

export type SetLog = {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
};

export type ExerciseNote = {
  sessionId: string;
  exerciseId: string;
  note: string;
};

export type DailyJournal = {
  clientId: string;
  date: string;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  dietCompliance: number;
  hunger: number;
  freeMeals: boolean;
  dietReason: string;
  trained: boolean;
  progressedLoads: boolean;
  hasSoreness: boolean;
  sorenessMuscles: string;
  hasPain: boolean;
  painDescription: string;
  steps: number | null;
  didCardio: boolean;
  performance: number;
  motivation: number;
  fatigue: number;
  stress: number;
  sleepHours: number | null;
  sleepQuality: number;
};

export type MeasurementField = {
  id: string;
  clientId: string;
  label: string;
  unit: string;
  type: FieldType;
  required: boolean;
};

export type MeasurementEntry = {
  id: string;
  clientId: string;
  date: string;
  values: Record<string, number | string | null>;
};

export type FeedbackField = {
  id: string;
  type: FeedbackFieldType;
  label: string;
};

export type FeedbackForm = {
  mesocycleId: string;
  fields: FeedbackField[];
};

export type FeedbackResponse = {
  mesocycleId: string;
  answers: Record<string, string | number | boolean>;
  submittedAt: string;
};

export const LOGGED_CLIENT_ID = "client-juan";

export type DemoState = {
  loggedIn: boolean;
  role: Role;
  selectedClientId: string;
  clients: ClientProfile[];
  mesocycles: Mesocycle[];
  trainingDays: TrainingDay[];
  exercises: RoutineExercise[];
  sessions: WorkoutSession[];
  setLogs: SetLog[];
  exerciseNotes: ExerciseNote[];
  journals: DailyJournal[];
  measurementFields: MeasurementField[];
  measurementEntries: MeasurementEntry[];
  feedbackForms: FeedbackForm[];
  feedbackResponses: FeedbackResponse[];
};
