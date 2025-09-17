let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let lapCount = 0;

const display = document.getElementById("display");
const startStopBtn = document.getElementById("startStopBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const laps = document.getElementById("laps");

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

function startStop() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    startStopBtn.textContent = "Start";
    lapBtn.disabled = true;
  } else {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(tick, 10);
    startStopBtn.textContent = "Pause";
    lapBtn.disabled = false;
    resetBtn.disabled = false;
  }
}

function reset() {
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = 0;
  elapsedTime = 0;
  lapCount = 0;
  display.textContent = "00:00:00";
  startStopBtn.textContent = "Start";
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  laps.innerHTML = "";
}

function recordLap() {
  lapCount += 1;

  const li = document.createElement("li");
  const label = document.createElement("span");
  const time = document.createElement("span");

  label.className = "lap-label";
  time.className = "lap-time";

  label.textContent = `Lap ${lapCount}`;
  time.textContent = formatTime(elapsedTime);

  li.appendChild(label);
  li.appendChild(time);

  // Append to bottom so Lap 1 stays at top (chronological)
  laps.appendChild(li);
}

startStopBtn.addEventListener("click", startStop);
resetBtn.addEventListener("click", reset);
lapBtn.addEventListener("click", recordLap);
