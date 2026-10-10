import { createContext, useContext } from "react";
import type { AuthContextValue } from "./auth.types";

export const AuthContext = createContext<AuthContextValue | null>(null);
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Auth components require AuthProvider");
  return context;
}
