"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDemo } from "@/lib/store";

export default function Home() {
  const { loggedIn, role, ready } = useDemo();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!loggedIn) {
      router.replace("/login");
      return;
    }
    router.replace(role === "coach" ? "/coach" : "/cliente");
  }, [loggedIn, role, ready, router]);

  return <div className="flex min-h-screen items-center justify-center text-muted">Abriendo demo…</div>;
}
