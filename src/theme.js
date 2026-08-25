const KEY = "theme-override"; // "light" | "dark" | null(시스템 설정 따름)

export function getStoredTheme() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light" || theme === "dark") {
    root.setAttribute("data-theme", theme);
  } else {
    root.removeAttribute("data-theme");
  }
}

export function setTheme(theme) {
  try {
    if (theme === "light" || theme === "dark") localStorage.setItem(KEY, theme);
    else localStorage.removeItem(KEY);
  } catch {
    // localStorage 접근 불가한 환경(사생활 보호 모드 등)이면 그냥 이번 세션에만 적용
  }
  applyTheme(theme);
}

export function isDarkActive() {
  const stored = getStoredTheme();
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
}
