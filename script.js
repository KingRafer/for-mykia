// ===== Theme Toggle =====
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

const savedTheme = localStorage.getItem("theme") || "light";
body.classList.remove("light", "dark");
body.classList.add(savedTheme);

themeToggle.addEventListener("click", () => {
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

musicToggle.addEventListener("click", async () => {
  try {
    if (isPlaying) {
      bgMusic.pause();
      musicIcon.textContent = "🎵";
      musicToggle.classList.remove("playing");
      isPlaying = false;
    } else {
      await bgMusic.play();
      musicIcon.textContent = "🎶";
      musicToggle.classList.add("playing");
      isPlaying = true;
    }
  } catch (err) {
    alert("Klik sekali lagi untuk memutar musik ya 💕");
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && isPlaying) bgMusic.pause();
  else if (!document.hidden && isPlaying) bgMusic.play().catch(() => {});
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
  if (distance < 0) statusEl.textContent = "Menuju 17 Oktober 2026 💕";
  else if (days === 0 && hours < 24) statusEl.textContent = "Hari ini hari jadian kita! 🎉💕";
  else statusEl.textContent = `Sudah ${days} hari bersama Saskia 💕`;
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ===== Gallery dari folder repo: photos/data.json =====
const galleryGrid = document.getElementById("gallery-grid");

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderGallery(photos) {
  galleryGrid.innerHTML = "";

  if (!photos || photos.length === 0) {
    galleryGrid.innerHTML =
      `<div class="gallery-empty">Belum ada foto. Klik "Cara Tambah Foto" untuk menambah kenangan 📷💕</div>`;
    return;
  }

  photos.forEach((photo) => {
    const card = document.createElement("div");
    card.className = "gallery-card";

    const hasDesc = photo.desc && photo.desc.trim() !== "";
    const hasDate = photo.date && photo.date.trim() !== "";
    const hasOverlay = hasDesc || hasDate;

    card.innerHTML = `
      <div class="gallery-media">
        <img src="${photo.src}" alt="${hasDesc ? photo.desc : "Kenangan"}" loading="lazy" />
        ${hasOverlay ? `
        <div class="gallery-overlay">
          ${hasDesc ? `<p class="overlay-desc">${photo.desc}</p>` : ""}
          ${hasDate ? `<span class="overlay-date">${formatDate(photo.date)}</span>` : ""}
        </div>` : ""}
      </div>
    `;

    card.addEventListener("click", () => openLightbox(photo));
    galleryGrid.appendChild(card);
  });
}

async function loadGallery() {
  try {
    // cache-bust supaya update data.json cepat kelihatan
    const res = await fetch("photos/data.json?t=" + Date.now());
    if (!res.ok) throw new Error("Gagal load data.json");
    const photos = await res.json();
    renderGallery(photos);
  } catch (err) {
    console.error(err);
    galleryGrid.innerHTML =
      `<div class="gallery-empty">Gagal memuat galeri. Cek file photos/data.json</div>`;
  }
}

// ===== Modal howto =====
const addModal = document.getElementById("add-modal");
const openAddModalBtn = document.getElementById("open-add-modal");
const closeAddModalBtn = document.getElementById("close-add-modal");

function openAddModal() {
  addModal.classList.remove("hidden");
  addModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeAddModal() {
  addModal.classList.add("hidden");
  addModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

openAddModalBtn.addEventListener("click", openAddModal);
closeAddModalBtn.addEventListener("click", closeAddModal);
addModal.addEventListener("click", (e) => {
  if (e.target === addModal) closeAddModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAddModal();
    closeLightbox();
  }
});

// ===== Lightbox + Download =====
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

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

downloadBtn.addEventListener("click", async (e) => {
  e.stopPropagation();
  if (!currentLightboxPhoto) return;

  try {
    const res = await fetch(currentLightboxPhoto.src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const name = currentLightboxPhoto.desc
      ? currentLightboxPhoto.desc.replace(/[^a-z0-9]/gi, "_").slice(0, 40)
      : "kenangan";
    const ext = (currentLightboxPhoto.src.split(".").pop() || "jpg").split("?")[0];
    link.download = `${name || "foto"}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    // fallback
    const link = document.createElement("a");
    link.href = currentLightboxPhoto.src;
    link.download = "foto.jpg";
    link.target = "_blank";
    link.click();
  }
});

loadGallery();
