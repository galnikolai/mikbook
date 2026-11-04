import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

const neueHaas = localFont({
  src: [
    {
      path: "./fonts/NeueHaasGroteskDisplayPro-35ExtraLight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/NeueHaasGroteskDisplayPro-55Roman.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NeueHaasGroteskDisplayPro-65Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/NeueHaasGroteskDisplayPro-75Bold.otf",
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
