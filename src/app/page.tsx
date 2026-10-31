import { Suspense } from "react";
import { LandingShell } from "@/components/landing/LandingShell";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[var(--landing-bg)] text-sm text-black/50">
          Chargement…
        </div>
      }
    >
      <LandingShell />
    </Suspense>
  );
}
