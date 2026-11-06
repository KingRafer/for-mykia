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

// ===== Music Player =====
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
    console.log("Audio play blocked or failed:", err);
    alert("Klik sekali lagi untuk memutar musik ya 💕\n(Browser kadang butuh interaksi dulu)");
  }
});

// Pause music when page is hidden (optional nice touch)
document.addEventListener("visibilitychange", () => {
  if (document.hidden && isPlaying) {
    bgMusic.pause();
  } else if (!document.hidden && isPlaying) {
    bgMusic.play().catch(() => {});
  }
});

// ===== Countdown (live) =====
// Anniversary: 17 Oktober 2026 00:00 WIB
const anniversaryDate = new Date("2026-10-17T00:00:00+07:00").getTime();

function updateCountdown() {
  const now = Date.now();
  const distance = now - anniversaryDate; // positive = already together

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const statusEl = document.getElementById("anniversary-status");

  // Always show time together (since anniversary has passed relative to now)
  const totalSeconds = Math.floor(Math.abs(distance) / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  daysEl.textContent = String(days).padStart(2, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");

  if (distance < 0) {
    // Still counting down
    statusEl.textContent = "Menuju 17 Oktober 2026 💕";
  } else if (days === 0 && hours < 24) {
    statusEl.textContent = "Hari ini hari jadian kita! 🎉💕";
  } else {
    statusEl.textContent = `Sudah ${days} hari bersama Saskia 💕`;
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ===== Photo Gallery =====
const STORAGE_KEY = "saskia_gallery_photos";
const galleryGrid = document.getElementById("gallery-grid");
const photoInput = document.getElementById("photo-input");
const photoDesc = document.getElementById("photo-desc");
const photoDate = document.getElementById("photo-date");
const addPhotoBtn = document.getElementById("add-photo-btn");

// Sample starter photos (placeholder gradients + text)
const defaultPhotos = [
  {
    id: "sample-1",
    src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=400&fit=crop",
    desc: "Awal kisah kita",
    date: "2026-10-17",
  },
  {
    id: "sample-2",
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=400&fit=crop",
    desc: "Senyummu favoritku",
    date: "2026-10-20",
  },
];

function loadPhotos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [...defaultPhotos];
}

function savePhotos(photos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderGallery() {
  const photos = loadPhotos();
  galleryGrid.innerHTML = "";

  if (photos.length === 0) {
    galleryGrid.innerHTML = `<div class="gallery-empty">Belum ada foto. Yuk tambahkan kenangan pertama! 📷💕</div>`;
    return;
  }

  photos.forEach((photo) => {
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.innerHTML = `
      <img src="${photo.src}" alt="${photo.desc || "Kenangan"}" loading="lazy" />
      <div class="gallery-card-info">
        <p class="gallery-card-desc">${photo.desc || "Tanpa deskripsi"}</p>
        <span class="gallery-card-date">${formatDate(photo.date) || ""}</span>
      </div>
    `;

    card.addEventListener("click", () => openLightbox(photo));
    galleryGrid.appendChild(card);
  });
}

function addPhoto() {
  const file = photoInput.files[0];
  if (!file) {
    alert("Pilih foto dulu ya 💕");
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar!");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const photos = loadPhotos();
    photos.unshift({
      id: "local-" + Date.now(),
      src: e.target.result, // base64
      desc: photoDesc.value.trim() || "Kenangan indah",
      date: photoDate.value || new Date().toISOString().slice(0, 10),
    });
    savePhotos(photos);
    renderGallery();

    // Reset form
    photoInput.value = "";
    photoDesc.value = "";
    photoDate.value = "";

    // Scroll to new photo
    galleryGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  reader.readAsDataURL(file);
}

addPhotoBtn.addEventListener("click", addPhoto);

// ===== Lightbox =====
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxDesc = document.getElementById("lightbox-desc");
const lightboxDate = document.getElementById("lightbox-date");
const lightboxClose = document.getElementById("lightbox-close");

function openLightbox(photo) {
  lightboxImg.src = photo.src;
  lightboxDesc.textContent = photo.desc || "";
  lightboxDate.textContent = formatDate(photo.date) || "";
  lightbox.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.add("hidden");
  document.body.style.overflow = "";
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// Init gallery
renderGallery();
