// Galeri bersama dimuat dari API GitHub melalui cloud-gallery.js.

// ===== Theme =====
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;
const savedTheme = localStorage.getItem("theme") || "light";
body.classList.remove("light", "dark");
body.classList.add(savedTheme);
themeToggle.addEventListener("click", function () {
  const isDark = body.classList.contains("dark");
  body.classList.remove("light", "dark");
  body.classList.add(isDark ? "light" : "dark");
  localStorage.setItem("theme", isDark ? "light" : "dark");
});

// ===== Music =====
const musicToggle = document.getElementById("music-toggle");
const musicIcon = document.getElementById("music-icon");
const bgMusic = document.getElementById("bg-music");
let isPlaying = false;
musicToggle.addEventListener("click", async function () {
  try {
    if (isPlaying) {
      bgMusic.pause();
      musicIcon.textContent = "\uD83C\uDFB5";
      musicToggle.classList.remove("playing");
      isPlaying = false;
    } else {
      await bgMusic.play();
      musicIcon.textContent = "\uD83C\uDFB6";
      musicToggle.classList.add("playing");
      isPlaying = true;
    }
  } catch (err) {
    alert("Klik sekali lagi untuk memutar musik ya \uD83D\uDC95");
  }
});
document.addEventListener("visibilitychange", function () {
  if (document.hidden && isPlaying) bgMusic.pause();
  else if (!document.hidden && isPlaying) bgMusic.play().catch(function () {});
});

// ===== Countdown =====
const anniversaryDate = new Date("2026-10-17T00:00:00+07:00").getTime();
function updateCountdown() {
  const now = Date.now();
  const distance = now - anniversaryDate;
  const totalSeconds = Math.floor(Math.abs(distance) / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
  const statusEl = document.getElementById("anniversary-status");
  if (distance < 0) statusEl.textContent = "Menuju 17 Oktober 2026 \uD83D\uDC95";
  else if (days === 0) statusEl.textContent = "Hari ini hari jadian kita! \uD83C\uDF89\uD83D\uDC95";
  else statusEl.textContent = "Sudah " + days + " hari bersama Saskia \uD83D\uDC95";
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ===== Gallery =====
const galleryGrid = document.getElementById("gallery-grid");

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderGallery(photos) {
  galleryGrid.innerHTML = "";
  if (!photos || !photos.length) {
    galleryGrid.innerHTML =
      '<div class="gallery-empty"><span class="gallery-empty-icon">✦</span><strong>Belum ada kenangan di sini</strong><span>Ruang kecil ini siap diisi dengan momen-momen indah kalian.</span></div>';
    return;
  }
  const frag = document.createDocumentFragment();
  photos.forEach(function (photo) {
    const card = document.createElement("div");
    card.className = "gallery-card";
    const hasDesc = photo.desc && photo.desc.trim() !== "";
    const hasDate = photo.date && String(photo.date).trim() !== "";
    const safeDesc = escapeHtml(photo.desc);
    const safeAlt = hasDesc ? safeDesc : "Kenangan";
    const src = (photo.src || "").replace(/^\//, "");
    var overlay = "";
    if (hasDesc || hasDate) {
      overlay = '<div class="gallery-overlay">';
      if (hasDesc) overlay += '<p class="overlay-desc">' + safeDesc + "</p>";
      if (hasDate)
        overlay +=
          '<span class="overlay-date">' +
          escapeHtml(formatDate(photo.date)) +
          "</span>";
      overlay += "</div>";
    }
    card.innerHTML =
      '<div class="gallery-media">' +
      '<img src="' +
      escapeHtml(src) +
      '" alt="' +
      safeAlt +
      '" loading="lazy" decoding="async" />' +
      overlay +
      "</div>";
    if (typeof photo.id === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[0-9a-f-]{36}\.(jpg|png|webp|gif)$/i.test(photo.id)) {
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "btn-delete-photo";
      deleteButton.textContent = "✕";
      deleteButton.setAttribute("aria-label", "Hapus foto");
      deleteButton.title = "Hapus foto";
      deleteButton.addEventListener("click", function (event) {
        event.stopPropagation();
        if (typeof window.requestPhotoDeletion === "function") {
          window.requestPhotoDeletion(photo.id);
        }
      });
      card.querySelector(".gallery-media").appendChild(deleteButton);
    }
    card.addEventListener("click", function () {
      openLightbox({
        src: src,
        desc: photo.desc,
        date: photo.date,
      });
    });
    frag.appendChild(card);
  });
  galleryGrid.appendChild(frag);
}

async function loadGallery() {
  try {
    const res = await fetch(DATA_URL + "?t=" + Date.now(), { cache: "no-store" });
    if (!res.ok) {
      renderGallery([]);
      return;
    }
    const data = await res.json();
    renderGallery(Array.isArray(data) ? data : []);
  } catch (e) {
    console.warn(e);
    renderGallery([]);
  }
}

// ===== Lightbox =====
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxDesc = document.getElementById("lightbox-desc");
const lightboxDate = document.getElementById("lightbox-date");
const lightboxClose = document.getElementById("lightbox-close");
const downloadBtn = document.getElementById("download-btn");
let currentLightboxPhoto = null;

function openLightbox(photo) {
  currentLightboxPhoto = photo;
  lightboxImg.src = photo.src;
  lightboxDesc.textContent = photo.desc || "";
  lightboxDesc.style.display = photo.desc ? "block" : "none";
  lightboxDate.textContent = formatDate(photo.date) || "";
  lightboxDate.style.display = photo.date ? "inline" : "none";
  lightbox.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.classList.add("hidden");
  document.body.style.overflow = "";
  currentLightboxPhoto = null;
}
if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightbox) {
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
}
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeLightbox();
});
if (downloadBtn) {
  downloadBtn.addEventListener("click", async function (e) {
    e.stopPropagation();
    if (!currentLightboxPhoto) return;
    try {
      const res = await fetch(currentLightboxPhoto.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "foto.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      window.open(currentLightboxPhoto.src, "_blank");
    }
  });
}

// Galeri dimuat oleh cloud-gallery.js agar tidak ada dua sumber data yang saling menimpa.
