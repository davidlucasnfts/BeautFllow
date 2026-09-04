/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, type ReactNode } from "react";
import type { SalonSegment } from "@contracts/segment-labels";

export type SalonRole = "owner" | "admin" | "professional" | "receptionist";

export type SalonContextType = {
  id: number;
  name: string;
  slug: string;
  segment: SalonSegment;
  role: SalonRole;
  plan: string;
};

export const SalonContext = createContext<{
  salon: SalonContextType | null;
  setSalon: (salon: SalonContextType | null) => void;
} | null>(null);

const STORAGE_KEY = "studioflow_active_salon";

export function SalonProvider({ children }: { children: ReactNode }) {
  const [salon, setSalonState] = useState<SalonContextType | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      return null;
    }
    return null;
  });

  const setSalon = (s: SalonContextType | null) => {
    setSalonState(s);
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <SalonContext.Provider value={{ salon, setSalon }}>
      {children}
    </SalonContext.Provider>
  );
}
