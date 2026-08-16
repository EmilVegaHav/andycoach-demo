"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BookOpen,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Ruler,
  Sparkles,
  Users,
  UserRound,
} from "lucide-react";
import { useEffect } from "react";
import { clientById } from "@/lib/selectors";
import { useDemo } from "@/lib/store";
import { cn } from "./ui";

const coachLinks = [
  { href: "/coach", label: "Clientes", icon: Users },
  { href: "/coach/mesociclos", label: "Mesociclos", icon: Dumbbell },
  { href: "/coach/progreso", label: "Progreso", icon: Activity },
  { href: "/coach/diario", label: "Diario", icon: BookOpen },
  { href: "/coach/medidas", label: "Medidas", icon: Ruler },
];

const clientLinks = [
  { href: "/cliente", label: "Hoy", icon: LayoutDashboard },
  { href: "/cliente/entrenamiento", label: "Entrenar", icon: Dumbbell },
  { href: "/cliente/diario", label: "Diario", icon: BookOpen },
  { href: "/cliente/medidas", label: "Medidas", icon: Ruler },
  { href: "/cliente/feedback", label: "Feedback", icon: Sparkles },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const state = useDemo();
  const { role, ready, loggedIn, dispatch } = state;
  const pathname = usePathname();
  const router = useRouter();
  const links = role === "coach" ? coachLinks : clientLinks;
  const selected = clientById(state);

  function isActive(href: string) {
    return (
      pathname === href ||
      (href === "/coach" && pathname.startsWith("/coach/clientes")) ||
      (href !== "/coach" && href !== "/cliente" && pathname.startsWith(href))
    );
  }

  useEffect(() => {
    if (!ready) return;
    if (!loggedIn) {
      router.replace("/login");
      return;
    }
    if (role === "client" && pathname.startsWith("/coach")) router.replace("/cliente");
    if (role === "coach" && pathname.startsWith("/cliente")) router.replace("/coach");
  }, [role, pathname, ready, loggedIn, router]);

  function logout() {
    dispatch({ type: "LOGOUT" });
    router.replace("/login");
  }

  if (!ready || !loggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">Cargando demo…</div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-line bg-ink text-paper lg:flex lg:flex-col">
        <div className="px-5 py-6">
          <p className="font-display text-3xl tracking-tight">AndyCoach</p>
          <p className="mt-1 text-xs text-white/50">Demo de coaching</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                  isActive(link.href) ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white">
            <UserRound size={16} />
            <span>
              <span className="block text-[11px] uppercase tracking-wide text-white/50">Sesión</span>
              {role === "coach" ? "Coach (admin)" : `${selected.name} (user)`}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
          <button
            onClick={() => {
              if (confirm("¿Restablecer el demo a los datos de ejemplo?")) dispatch({ type: "RESET" });
            }}
            className="w-full text-left text-xs text-white/40 hover:text-white/70"
          >
            Restablecer datos
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-card/80 px-4 py-3 backdrop-blur lg:px-8">
          <div className="lg:hidden">
            <p className="font-display text-xl">AndyCoach</p>
          </div>
          <p className="hidden text-sm text-muted lg:block">
            {role === "coach" ? (
              <>
                Viendo a <span className="font-medium text-ink">{selected.name}</span>
                {" · "}
                <Link href="/coach" className="text-accent">
                  Cambiar cliente
                </Link>
              </>
            ) : (
              <>
                Sesión de <span className="font-medium text-ink">{selected.name}</span>
              </>
            )}
          </p>
          <button
            onClick={logout}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink"
          >
            Cerrar sesión
          </button>
        </header>
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-950 lg:px-8">
          Demo con datos locales. Coach: admin / admin · Cliente: user / user.
        </div>
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        <nav className="sticky bottom-0 grid grid-cols-5 border-t border-line bg-card lg:hidden">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[10px]",
                  isActive(link.href) ? "text-accent" : "text-muted",
                )}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
