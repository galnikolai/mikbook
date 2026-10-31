import type { Metadata } from "next";
import { Geist_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";

const grotesk = Inter_Tight({
  variable: "--font-grotesk",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIKBOOK",
  description:
    "Synthèse méthodique du programme des EDN — mémorisation visuelle et logique.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${grotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${grotesk.className} min-h-full`}>{children}</body>
    </html>
  );
}
