import type { Role } from "./types";

export const DEMO_USERS = [
  { username: "admin", password: "admin", role: "coach" as Role, label: "Coach" },
  { username: "user", password: "user", role: "client" as Role, label: "Cliente" },
] as const;

export function authenticate(username: string, password: string) {
  const normalized = username.trim().toLowerCase();
  return DEMO_USERS.find((account) => account.username === normalized && account.password === password) ?? null;
}
