const toggleBtn = document.getElementById("themeToggle");
const root = document.documentElement;

const saved = localStorage.getItem("theme");
const updateIcon = (isDark) => {
  toggleBtn.textContent = isDark ? "☀️" : "🌙";
};

if (saved) {
  root.classList.add(saved);
  updateIcon(saved === "dark");
}

toggleBtn?.addEventListener("click", () => {
  root.classList.toggle("dark");
  const isDark = root.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "");
  updateIcon(isDark);
});
