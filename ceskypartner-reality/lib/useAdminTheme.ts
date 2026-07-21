"use client";

import { useState, useEffect, useCallback } from "react";

type AdminTheme = "dark" | "light";
const STORAGE_KEY = "cp-admin-theme";

export function useAdminTheme() {
  const [theme, setThemeState] = useState<AdminTheme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("theme") as AdminTheme | null;
    if (fromUrl === "light" || fromUrl === "dark") {
      setThemeState(fromUrl);
      localStorage.setItem(STORAGE_KEY, fromUrl);
      return;
    }
    const saved = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
    if (saved === "light" || saved === "dark") setThemeState(saved);
  }, []);

  const setTheme = useCallback((t: AdminTheme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle, mounted };
}
