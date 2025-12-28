import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";
export const DEFAULT_THEME: Theme = "dark";

type ThemeProviderProps = {
  children: ReactNode;
  initialTheme: Theme;
};

function saveTheme(theme: Theme) {
  localStorage.setItem("theme", theme);
}

function loadTheme(defaultTheme: Theme) {
  const theme = localStorage.getItem("theme") as Theme;
  return theme ?? defaultTheme;
}

const ThemeContext = createContext({
  theme: "dark" as Theme,
  setTheme: (_theme: Theme) => {},
});

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
}: ThemeProviderProps) {
  const [theme, _setTheme] = useState(() => loadTheme(initialTheme));

  useEffect(() => {
    setRootTheme(theme);
  }, [theme]);

  function setRootTheme(theme: Theme) {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }

  function setTheme(theme: Theme) {
    _setTheme(theme);
    setRootTheme(theme);
    saveTheme(theme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export type Vec2 = [number, number];
export function useAnimatedThemeToggle() {
  const { theme, setTheme } = useTheme();

  function toggleTheme(coords?: Vec2) {
    const root = document.documentElement;
    const newMode = theme == "dark" ? "light" : "dark";

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!document.startViewTransition || prefersReducedMotion) {
      setTheme(newMode);
      return;
    }

    if (coords) {
      const [x, y] = coords;
      root.style.setProperty("--x", `${x}px`);
      root.style.setProperty("--y", `${y}px`);
    }

    document.startViewTransition(() => {
      setTheme(newMode);
    });
  }

  return toggleTheme;
}
