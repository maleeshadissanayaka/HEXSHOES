import { createContext, useContext } from "react";
import type { ExperienceDialog } from "../types/experience";
export const ExperienceContext = createContext<{
  open: (dialog: ExperienceDialog) => void;
  close: () => void;
} | null>(null);
export function useExperience() {
  const context = useContext(ExperienceContext);
  if (!context)
    throw new Error("Experience components require ExperienceProvider");
  return context;
}
