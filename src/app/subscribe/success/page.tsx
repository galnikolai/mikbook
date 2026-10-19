"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`,
        );
        const data = (await res.json()) as { email?: string; error?: string };
        if (!res.ok) throw new Error(data.error);
        if (!cancelled) {
          setEmail(data.email ?? null);
          setStatus("ok");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <main className="subscribe-page">
      <h1>Abonnement</h1>
      {status === "loading" && <p>Confirmation du paiement…</p>}
      {status === "ok" && (
        <>
          <p>Merci — votre abonnement MIKBOOK est actif.</p>
          {email && <p className="subscribe-page__meta">{email}</p>}
          <Link href="/">Retour à l&apos;accueil</Link>
        </>
      )}
      {status === "error" && (
        <>
          <p>Impossible de confirmer la session. Contactez le support si le débit a eu lieu.</p>
          <Link href="/">Retour</Link>
        </>
      )}
    </main>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={<main className="subscribe-page">Chargement…</main>}>
      <SuccessInner />
    </Suspense>
  );
}
