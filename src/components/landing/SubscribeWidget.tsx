"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PlanId = "monthly" | "yearly";

const PLANS: { id: PlanId; label: string; price: string; hint: string }[] = [
  { id: "monthly", label: "Mensuel", price: "19,99 €", hint: "/ mois" },
  { id: "yearly", label: "Annuel", price: "149 €", hint: "/ an" },
];

export function SubscribeWidget() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<PlanId | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function startCheckout(plan: PlanId) {
    setError(null);
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout unavailable");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(null);
    }
  }

  async function openPortal() {
    setError(null);
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Portal unavailable");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(null);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed right-4 bottom-4 z-[9999]">
      <div className="pointer-events-auto">
        {!open ? (
          <button
            type="button"
            className="cursor-pointer rounded-full bg-black px-5 py-3.5 text-[13px] font-semibold tracking-wide text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)]"
            onClick={() => setOpen(true)}
          >
            S&apos;abonner
          </button>
        ) : (
          <div className="w-[min(291px,calc(100vw-2rem))] rounded-xl border border-white/12 bg-black p-3.5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <strong className="text-sm">MIKBOOK</strong>
              <button
                type="button"
                className="cursor-pointer px-1 text-xl leading-none text-white"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            <p className="mb-3 text-xs text-white/55">
              Abonnement — accès à la plateforme
            </p>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {PLANS.map((plan) => (
                <li key={plan.id}>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-white/15 bg-white/10 px-2.5 py-2.5 text-left text-[13px] text-white disabled:cursor-wait disabled:opacity-60"
                    disabled={loading !== null}
                    onClick={() => startCheckout(plan.id)}
                  >
                    <span>
                      <span className="block font-semibold">{plan.label}</span>
                      <span className="block text-[11px] text-white/50">{plan.hint}</span>
                    </span>
                    <span className="whitespace-nowrap font-bold">
                      {loading === plan.id ? "…" : plan.price}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-2.5 w-full cursor-pointer bg-transparent py-1.5 text-xs text-white underline underline-offset-2 disabled:cursor-wait disabled:opacity-60"
              disabled={loading !== null}
              onClick={openPortal}
            >
              {loading === "portal" ? "…" : "Gérer mon abonnement"}
            </button>
            {error && <p className="mt-2 text-[11px] text-[#ff6b7a]">{error}</p>}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
