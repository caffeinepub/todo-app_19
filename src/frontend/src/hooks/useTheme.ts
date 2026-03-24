import { useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "taskflow-theme";

function getStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // ignore
  }
  return "system";
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  return pref === "system" ? getSystemTheme() : pref;
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

let listeners: Array<() => void> = [];

function notifyListeners() {
  for (const fn of listeners) fn();
}

export function setTheme(t: ThemePreference) {
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    // ignore
  }
  applyTheme(resolveTheme(t));
  notifyListeners();
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>(getStoredTheme);

  useEffect(() => {
    const update = () => setThemeState(getStoredTheme());
    listeners.push(update);
    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(resolveTheme("system"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  useEffect(() => {
    applyTheme(resolveTheme(theme));
  }, [theme]);

  const resolvedTheme = resolveTheme(theme);

  return { theme, resolvedTheme, setTheme };
}
