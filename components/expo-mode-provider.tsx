"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicRuntimeMode } from "@/app/lib/expo-config";

const ExpoModeContext = createContext<PublicRuntimeMode>({ expoOffline: false });

export function ExpoModeProvider({
  value,
  children,
}: {
  value: PublicRuntimeMode;
  children: ReactNode;
}) {
  return (
    <ExpoModeContext.Provider value={value}>
      {children}
    </ExpoModeContext.Provider>
  );
}

export function useExpoMode() {
  return useContext(ExpoModeContext);
}
