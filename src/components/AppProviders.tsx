"use client";

import { Suspense, type ReactNode } from "react";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { SubscribeWidget } from "@/components/landing/SubscribeWidget";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      {children}
      <Suspense fallback={null}>
        <SubscribeWidget />
      </Suspense>
    </LocaleProvider>
  );
}
