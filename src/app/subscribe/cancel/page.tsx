import Link from "next/link";

export default function SubscribeCancelPage() {
  return (
    <main className="subscribe-page">
      <h1>Paiement annulé</h1>
      <p>Aucun prélèvement n&apos;a été effectué.</p>
      <Link href="/">Retour à l&apos;accueil</Link>
    </main>
  );
}
