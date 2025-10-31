/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "jd-analyzer-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const prefersDarkMode = () => {
  if (
    globalThis.window === undefined ||
    typeof globalThis.matchMedia !== "function"
  ) {
    return false;
  }

  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
};

const getInitialTheme = (): Theme => {
  if (globalThis.window === undefined) {
    return "dark";
  }

  const storedTheme = globalThis.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return prefersDarkMode() ? "dark" : "light";
};

const applyThemeClass = (theme: Theme) => {
  if (typeof document === "undefined") {
    return;
  }

  const targets = [document.documentElement, document.body];

  for (const element of targets) {
    if (!element) continue;
    element.classList.remove("light", "dark");
    element.classList.add(theme);
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useLayoutEffect(() => {
    applyThemeClass(theme);
    if (globalThis.window !== undefined) {
      globalThis.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
