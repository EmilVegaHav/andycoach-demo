import { LOGGED_CLIENT_ID, type DemoState } from "./types";

export function scopedClientId(state: DemoState): string {
  if (state.role === "client") return LOGGED_CLIENT_ID;
  return state.selectedClientId || state.clients[0]?.id || LOGGED_CLIENT_ID;
}

export function clientById(state: DemoState, clientId = scopedClientId(state)) {
  return state.clients.find((item) => item.id === clientId) ?? state.clients[0];
}

export function scopeForClient(state: DemoState, clientId = scopedClientId(state)) {
  const client = clientById(state, clientId);
  const mesocycles = state.mesocycles.filter((item) => item.clientId === client.id);
  const mesoIds = new Set(mesocycles.map((item) => item.id));
  const trainingDays = state.trainingDays.filter((day) => mesoIds.has(day.mesocycleId));
  const dayIds = new Set(trainingDays.map((day) => day.id));
  const exercises = state.exercises.filter((exercise) => dayIds.has(exercise.trainingDayId));
  const sessions = state.sessions.filter((session) => dayIds.has(session.trainingDayId));
  const sessionIds = new Set(sessions.map((session) => session.id));
  return {
    client,
    mesocycles,
    trainingDays,
    exercises,
    sessions,
    setLogs: state.setLogs.filter((log) => sessionIds.has(log.sessionId)),
    exerciseNotes: state.exerciseNotes.filter((note) => sessionIds.has(note.sessionId)),
    journals: state.journals.filter((item) => item.clientId === client.id),
    measurementFields: state.measurementFields.filter((item) => item.clientId === client.id),
    measurementEntries: state.measurementEntries.filter((item) => item.clientId === client.id),
    feedbackForms: state.feedbackForms.filter((item) => mesoIds.has(item.mesocycleId)),
    feedbackResponses: state.feedbackResponses.filter((item) => mesoIds.has(item.mesocycleId)),
  };
}
