// App preferences (theme, notifications, privacy). Stored in localStorage.
// Mirrors the approach used for the profile model in profile.ts.

export type ThemeMode = "system" | "light" | "dark";

export type Preferences = {
  theme: ThemeMode;
  notifications: {
    dailyReminder: boolean;
    goalProgress: boolean;
    weeklyReport: boolean;
    tips: boolean;
  };
  privacy: {
    analytics: boolean;
    personalization: boolean;
  };
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "system",
  notifications: {
    dailyReminder: true,
    goalProgress: true,
    weeklyReport: false,
    tips: true,
  },
  privacy: {
    analytics: false,
    personalization: true,
  },
};

const KEY = "sereine.preferences.v1";

export function loadPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    // Merge with defaults so missing keys stay valid across versions.
    return {
      theme: parsed.theme ?? DEFAULT_PREFERENCES.theme,
      notifications: { ...DEFAULT_PREFERENCES.notifications, ...parsed.notifications },
      privacy: { ...DEFAULT_PREFERENCES.privacy, ...parsed.privacy },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(p: Preferences) {
  window.localStorage.setItem(KEY, JSON.stringify(p));
}

export function clearPreferences() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

// Apply the chosen theme by toggling the `.dark` class on <html>.
// styles.css defines `@custom-variant dark (&:is(.dark *))`.
export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const prefersDark =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
}
