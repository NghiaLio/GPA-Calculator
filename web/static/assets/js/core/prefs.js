// =================== PREFERENCES (localStorage) ===================
// Lưu các tuỳ chọn giao diện/ứng dụng của người dùng trên thiết bị này.
const PREFS_KEY = "app_prefs";
const DEFAULT_PREFS = {
  theme: null, // "light" | "dark" | null (theo hệ thống)
  groupBySemester: false,
  showInsights: false,
  totalCredits: 120,
  targetGpa: 3.2,
  lastNamHoc: "",
  lastHocKy: "",
};

function getPrefs() {
  try {
    return {
      ...DEFAULT_PREFS,
      ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"),
    };
  } catch (e) {
    return { ...DEFAULT_PREFS };
  }
}

function setPref(key, value) {
  const prefs = getPrefs();
  prefs[key] = value;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    /* Bỏ qua khi bộ nhớ đầy hoặc bị chặn (chế độ riêng tư) */
  }
  return prefs;
}

// -------- Giao diện sáng / tối --------
function currentTheme() {
  const saved = getPrefs().theme;
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme() {
  const theme = currentTheme();
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0b1220" : "#1e40af");
  updateThemeButton();
}

function toggleTheme() {
  setPref("theme", currentTheme() === "dark" ? "light" : "dark");
  applyTheme();
}

function updateThemeButton() {
  const btn = document.getElementById("btnTheme");
  if (!btn) return;
  const dark = currentTheme() === "dark";
  btn.textContent = dark ? "☀️" : "🌙";
  btn.title = dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối";
  btn.setAttribute("aria-label", btn.title);
}

// Theo dõi thay đổi theme của hệ điều hành khi người dùng chưa chọn thủ công
if (window.matchMedia) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    const saved = getPrefs().theme;
    if (saved !== "light" && saved !== "dark") applyTheme();
  };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
}

applyTheme();
