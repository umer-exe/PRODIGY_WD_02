let startTime = 0;
let elapsedTime = 0;
let timerInterval;

const display = document.getElementById("display");
const startStopBtn = document.getElementById("startStopBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const laps = document.getElementById("laps");

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const milliseconds = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
  return `${minutes}:${seconds}:${milliseconds}`;
}

function startStop() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    startStopBtn.textContent = "Start";
    lapBtn.disabled = true;
  } else {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      display.textContent = formatTime(elapsedTime);
    }, 10);
    startStopBtn.textContent = "Pause";
    lapBtn.disabled = false;
    resetBtn.disabled = false;
  }
}

function reset() {
  clearInterval(timerInterval);
  timerInterval = null;
  elapsedTime = 0;
  display.textContent = "00:00:00";
  startStopBtn.textContent = "Start";
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  laps.innerHTML = "";
}

function recordLap() {
  const li = document.createElement("li");
  li.textContent = formatTime(elapsedTime);
  laps.appendChild(li);
}

startStopBtn.addEventListener("click", startStop);
resetBtn.addEventListener("click", reset);
lapBtn.addEventListener("click", recordLap);
