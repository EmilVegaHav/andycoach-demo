"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { authenticate } from "@/lib/auth";
import { useDemo } from "@/lib/store";
import { Button, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const { loggedIn, role, ready, dispatch } = useDemo();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !loggedIn) return;
    router.replace(role === "coach" ? "/coach" : "/cliente");
  }, [ready, loggedIn, role, router]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const account = authenticate(username, password);
    if (!account) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }
    dispatch({ type: "LOGIN", role: account.role });
    router.replace(account.role === "coach" ? "/coach" : "/cliente");
  }

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-muted">Cargando demo…</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="font-display text-5xl tracking-tight">AndyCoach</p>
          <p className="mt-2 text-muted">Iniciá sesión para ver el demo</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-card p-6 shadow-sm">
          <Field label="Usuario">
            <Input
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError("");
              }}
              placeholder="admin o user"
              required
            />
          </Field>
          <Field label="Contraseña">
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              required
            />
          </Field>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
        <div className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm text-muted">
          <p className="font-medium text-ink">Cuentas de prueba</p>
          <p className="mt-1">
            Coach: <span className="font-medium text-ink">admin</span> / <span className="font-medium text-ink">admin</span>
          </p>
          <p>
            Cliente: <span className="font-medium text-ink">user</span> / <span className="font-medium text-ink">user</span>
          </p>
        </div>
      </div>
    </div>
  );
}
