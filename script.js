// ===== State =====
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;

let lapCount = 0;
let lapsData = [];           // each item: { totalMs, splitMs }

// ===== Elements =====
const display = document.getElementById("display");
const startStopBtn = document.getElementById("startStopBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const laps = document.getElementById("laps");
const themeSwitch = document.getElementById("themeSwitch");
const card = document.getElementById("card");

// ===== Utilities =====
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  const centis  = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");
  return `${minutes}:${seconds}:${centis}`;
}

function tick() {
  elapsedTime = Date.now() - startTime;
  display.textContent = formatTime(elapsedTime);
}

// ===== Rendering =====
function renderLaps() {
  laps.innerHTML = "";

  if (lapsData.length > 0) {
    // Determine fastest/slowest by split time (ignore first if split=total)
    const splitTimes = lapsData.map(l => l.splitMs);
    const fastest = Math.min(...splitTimes);
    const slowest = Math.max(...splitTimes);

    lapsData.forEach((lap, i) => {
      const li = document.createElement("li");

      const label = document.createElement("span");
      label.className = "lap-label";
      label.textContent = `Lap ${i + 1}`;

      // badges
      const badge = document.createElement("span");
      if (lap.splitMs === fastest && lapsData.length > 1) {
        badge.className = "badge fastest";
        badge.textContent = "FASTEST";
      } else if (lap.splitMs === slowest && lapsData.length > 1) {
        badge.className = "badge slowest";
        badge.textContent = "SLOWEST";
      }

      const time = document.createElement("span");
      time.className = "lap-time";
      time.textContent = formatTime(lap.totalMs);

      const split = document.createElement("span");
      split.className = "lap-split";
      split.textContent = `+${formatTime(lap.splitMs)}`;

      // layout: [label + badge] [split] [total]
      const labelWrap = document.createElement("span");
      labelWrap.appendChild(label);
      if (badge.textContent) labelWrap.appendChild(badge);

      li.appendChild(labelWrap);
      li.appendChild(split);
      li.appendChild(time);
      laps.appendChild(li);
    });
  }
}

// ===== Persistence =====
const STORAGE_KEY = "stopwatch_state_v1";

function saveState() {
  const data = {
    running: Boolean(timerInterval),
    startTime,
    elapsedTime,
    lapCount,
    lapsData,
    theme: document.body.classList.contains("dark") ? "dark" : "light",
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);
    if (data.theme === "dark") {
      document.body.classList.add("dark");
      themeSwitch.checked = true;
    }

    elapsedTime = Number(data.elapsedTime || 0);
    startTime = Date.now() - elapsedTime;
    lapCount = Number(data.lapCount || 0);
    lapsData = Array.isArray(data.lapsData) ? data.lapsData : [];

    display.textContent = formatTime(elapsedTime);
    renderLaps();

    if (data.running) {
      timerInterval = setInterval(tick, 10);
      startStopBtn.textContent = "Pause";
      lapBtn.disabled = false;
      resetBtn.disabled = lapsData.length === 0 && elapsedTime === 0;
      card.classList.add("running");
    } else {
      startStopBtn.textContent = elapsedTime > 0 ? "Start" : "Start";
      lapBtn.disabled = elapsedTime === 0;
      resetBtn.disabled = elapsedTime === 0 && lapsData.length === 0;
    }
  } catch {
    // ignore parse errors
  }
}

// ===== Core actions =====
function startStop() {
  if (timerInterval) {
    // pause
    clearInterval(timerInterval);
    timerInterval = null;
    startStopBtn.textContent = "Start";
    lapBtn.disabled = true;
    card.classList.remove("running");
  } else {
    // start / resume
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(tick, 10);
    startStopBtn.textContent = "Pause";
    lapBtn.disabled = false;
    resetBtn.disabled = false;
    card.classList.add("running");
  }
  saveState();
}

function reset() {
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = 0;
  elapsedTime = 0;
  lapCount = 0;
  lapsData = [];
  display.textContent = "00:00:00";
  startStopBtn.textContent = "Start";
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  laps.innerHTML = "";
  card.classList.remove("running");
  saveState();
}

function recordLap() {
  lapCount += 1;

  const lastTotal = lapsData.length ? lapsData[lapsData.length - 1].totalMs : 0;
  const totalMs = elapsedTime;
  const splitMs = totalMs - lastTotal;

  lapsData.push({ totalMs, splitMs });
  renderLaps();

  resetBtn.disabled = false;
  saveState();
}

// ===== Events =====
startStopBtn.addEventListener("click", startStop);
resetBtn.addEventListener("click", reset);
lapBtn.addEventListener("click", recordLap);

// Keyboard shortcuts: Space=start/pause, L=lap, R=reset
document.addEventListener("keydown", (e) => {
  const tag = (e.target && e.target.tagName) || "";
  // avoid triggering while typing in inputs (if you add any later)
  if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

  if (e.code === "Space") {
    e.preventDefault();
    startStop();
  } else if ((e.key === "l" || e.key === "L") && !lapBtn.disabled) {
    recordLap();
  } else if ((e.key === "r" || e.key === "R") && !resetBtn.disabled) {
    reset();
  }
});

// Theme toggle + persistence
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeSwitch.checked = true;
}
themeSwitch.addEventListener("change", () => {
  const dark = themeSwitch.checked;
  document.body.classList.toggle("dark", dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
  saveState();
});

// Save state on unload (extra safety)
window.addEventListener("beforeunload", saveState);

// Init
loadState();
