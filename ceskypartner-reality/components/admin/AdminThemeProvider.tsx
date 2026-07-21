"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAdminTheme } from "@/lib/useAdminTheme";

type ThemeCtx = ReturnType<typeof useAdminTheme>;

const Ctx = createContext<ThemeCtx>({
  theme: "dark",
  setTheme: () => {},
  toggle: () => {},
  mounted: false,
});

export const useTheme = () => useContext(Ctx);

export default function AdminThemeProvider({ children }: { children: ReactNode }) {
  const value = useAdminTheme();

  return (
    <Ctx.Provider value={value}>
      <div className={`h-screen ${value.theme === "light" ? "admin-light" : "admin-dark"}`}>
        {children}
      </div>
    </Ctx.Provider>
  );
}
