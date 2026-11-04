"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { consumeSubscribePending } from "@/lib/subscribe";

type PlanId = "monthly" | "yearly";

export function SubscribeWidget() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "1";
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<PlanId | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plans: { id: PlanId; label: string; price: string; hint: string }[] = [
    { id: "monthly", label: t.monthly, price: "19,99 €", hint: t.perMonth },
    { id: "yearly", label: t.yearly, price: "149 €", hint: t.perYear },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const openFromCta = () => setOpen(true);
    window.addEventListener("mikbook:subscribe", openFromCta);
    if (consumeSubscribePending()) setOpen(true);
    return () => window.removeEventListener("mikbook:subscribe", openFromCta);
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
        throw new Error(data.error || t.checkoutError);
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : t.genericError);
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
        throw new Error(data.error || t.portalError);
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : t.genericError);
      setLoading(null);
    }
  }

  if (!mounted || editMode) return null;

  return createPortal(
    <div
      className={`subscribe-widget${open ? " is-open" : ""}`}
      data-open={open ? "true" : "false"}
    >
      <div className="subscribe-widget__shell">
        <button
          type="button"
          className="subscribe-widget__fab"
          tabIndex={open ? -1 : 0}
          aria-hidden={open}
          onClick={() => setOpen(true)}
        >
          {t.subscribe}
        </button>

        <div className="subscribe-widget__expand" aria-hidden={!open}>
          <div className="subscribe-widget__expand-inner">
            <div className="subscribe-widget__panel">
              <div className="subscribe-widget__head">
                <strong className="site-brand subscribe-widget__brand">
                  MIKBOOK
                </strong>
                <button
                  type="button"
                  className="subscribe-widget__close"
                  aria-label={t.close}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>
              <p className="subscribe-widget__lead">{t.subscribeLead}</p>
              <ul className="subscribe-widget__plans">
                {plans.map((plan) => (
                  <li key={plan.id}>
                    <button
                      type="button"
                      className="subscribe-widget__plan"
                      disabled={!open || loading !== null}
                      tabIndex={open ? 0 : -1}
                      onClick={() => startCheckout(plan.id)}
                    >
                      <span>
                        <span className="subscribe-widget__plan-label">
                          {plan.label}
                        </span>
                        <span className="subscribe-widget__plan-hint">
                          {plan.hint}
                        </span>
                      </span>
                      <span className="subscribe-widget__plan-price">
                        {loading === plan.id ? "…" : plan.price}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="subscribe-widget__manage"
                disabled={!open || loading !== null}
                tabIndex={open ? 0 : -1}
                onClick={openPortal}
              >
                {loading === "portal" ? "…" : t.manage}
              </button>
              {error && <p className="subscribe-widget__error">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
