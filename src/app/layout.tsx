import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

const neueHaas = localFont({
  src: [
    {
      path: "./fonts/NeueHaasDisplayThin.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/NeueHaasDisplayLight.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/NeueHaasDisplayRoman.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NeueHaasDisplayMedium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/NeueHaasDisplayBold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-grotesk",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const futuraBrand = localFont({
  src: "./fonts/FuturaCyrillicMedium.ttf",
  variable: "--font-brand",
  display: "swap",
  weight: "500",
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
      className={`${neueHaas.variable} ${geistMono.variable} ${futuraBrand.variable} h-full antialiased`}
    >
      <body className={`${neueHaas.className} min-h-full`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
