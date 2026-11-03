import type { Metadata } from "next";
import { Geist_Mono, Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({
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
      className={`${jost.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${jost.className} min-h-full`}>{children}</body>
    </html>
  );
}
