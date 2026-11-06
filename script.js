// ===== Theme Toggle =====
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

// Load saved theme or default to light
const savedTheme = localStorage.getItem("theme") || "light";
body.classList.remove("light", "dark");
body.classList.add(savedTheme);

themeToggle.addEventListener("click", () => {
  const isDark = body.classList.contains("dark");
  body.classList.remove("light", "dark");
  body.classList.add(isDark ? "light" : "dark");
  localStorage.setItem("theme", isDark ? "light" : "dark");
});

// ===== Countdown to 17 Oktober 2026 =====
const anniversaryDate = new Date("2026-10-17T00:00:00+07:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = anniversaryDate - now;

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const statusEl = document.getElementById("anniversary-status");

  if (distance <= 0) {
    // Anniversary has arrived or passed
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";

    // Calculate days since anniversary
    const daysSince = Math.floor(Math.abs(distance) / (1000 * 60 * 60 * 24));
    if (daysSince === 0) {
      statusEl.textContent = "Hari ini adalah hari jadian kita! 🎉💕";
    } else {
      statusEl.textContent = `Sudah ${daysSince} hari bersama 💕`;
    }
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  daysEl.textContent = String(days).padStart(2, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");

  statusEl.textContent = "Menuju 17 Oktober 2026 💕";
}

// Initial call + interval
updateCountdown();
setInterval(updateCountdown, 1000);

// ===== Smooth scroll for any future nav links =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
