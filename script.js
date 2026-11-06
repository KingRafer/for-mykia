// ===== Cloudinary (opsional) =====
// Buat Unsigned Upload Preset di Cloudinary Dashboard → Settings → Upload
// lalu isi nama preset di bawah. Kalau kosong / error, otomatis pakai penyimpanan lokal (base64).
const CLOUD_NAME = "djpavitu";
const UPLOAD_PRESET = ""; // contoh: "for_mykia" — harus Unsigned Upload Preset
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const USE_CLOUDINARY = Boolean(CLOUD_NAME && UPLOAD_PRESET);

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
  if (distance < 0) {
    statusEl.textContent = "Menuju 17 Oktober 2026 💕";
  } else if (days === 0) {
    statusEl.textContent = "Hari ini hari jadian kita! 🎉💕";
  } else {
    statusEl.textContent = `Sudah ${days} hari bersama Saskia 💕`;
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ===== Gallery =====
const STORAGE_KEY = "saskia_gallery_photos";
const galleryGrid = document.getElementById("gallery-grid");
const photoInput = document.getElementById("photo-input");
const photoDesc = document.getElementById("photo-desc");
const photoDate = document.getElementById("photo-date");
const addPhotoBtn = document.getElementById("add-photo-btn");
const addPhotoLabel = document.getElementById("add-photo-label");
const uploadStatus = document.getElementById("upload-status");
const previewImg = document.getElementById("preview-img");
const previewPlaceholder = document.getElementById("preview-placeholder");
const fileDropText = document.getElementById("file-drop-text");

let permanentPhotos = [];

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function loadLocalPhotos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
}

function saveLocalPhotos(photos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

function getAllPhotos() {
  const local = loadLocalPhotos();
  const map = new Map();
  permanentPhotos.forEach((p) => map.set(p.id || p.src, p));
  local.forEach((p) => map.set(p.id || p.src, p));
  return Array.from(map.values()).sort((a, b) => {
    const da = a.date || "";
    const db = b.date || "";
    if (da && db) return db.localeCompare(da);
    if (da) return -1;
    if (db) return 1;
    return 0;
  });
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

function renderGallery() {
  const photos = getAllPhotos();
  galleryGrid.innerHTML = "";

  if (!photos.length) {
    galleryGrid.innerHTML =
      `<div class="gallery-empty">Belum ada foto. Yuk tambahkan kenangan pertama! 📷💕</div>`;
    return;
  }

  photos.forEach((photo) => {
    const card = document.createElement("div");
    card.className = "gallery-card";

    const hasDesc = photo.desc && photo.desc.trim() !== "";
    const hasDate = photo.date && photo.date.trim() !== "";
    const hasOverlay = hasDesc || hasDate;
    const safeDesc = escapeHtml(photo.desc);
    const safeAlt = hasDesc ? safeDesc : "Kenangan";

    card.innerHTML = `
      <div class="gallery-media">
        <img src="${escapeHtml(photo.src)}" alt="${safeAlt}" loading="lazy" />
        ${
          hasOverlay
            ? `<div class="gallery-overlay">
          ${hasDesc ? `<p class="overlay-desc">${safeDesc}</p>` : ""}
          ${hasDate ? `<span class="overlay-date">${escapeHtml(formatDate(photo.date))}</span>` : ""}
        </div>`
            : ""
        }
        ${
          photo.local
            ? `<button type="button" class="btn-delete-photo" title="Hapus foto" aria-label="Hapus foto">✕</button>`
            : ""
        }
      </div>
    `;

    const deleteBtn = card.querySelector(".btn-delete-photo");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("Hapus foto ini dari galeri?")) {
          const list = loadLocalPhotos().filter(
            (p) => (p.id || p.src) !== (photo.id || photo.src)
          );
          saveLocalPhotos(list);
          renderGallery();
        }
      });
    }

    card.addEventListener("click", () => openLightbox(photo));
    galleryGrid.appendChild(card);
  });
}

async function loadPermanentPhotos() {
  try {
    const res = await fetch("photos/data.json", { cache: "no-cache" });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) {
      permanentPhotos = data.map((p, i) => ({
        id: p.id || `permanent-${i}-${p.src}`,
        src: p.src,
        desc: p.desc || "",
        date: p.date || "",
        local: false,
      }));
    }
  } catch (e) {
    // folder/data.json belum ada — tidak masalah
  }
}

// ===== Modal =====
const addModal = document.getElementById("add-modal");
const openAddModalBtn = document.getElementById("open-add-modal");
const closeAddModalBtn = document.getElementById("close-add-modal");

function openAddModal() {
  addModal.classList.remove("hidden");
  addModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  uploadStatus.textContent = USE_CLOUDINARY
    ? "Foto diupload ke cloud, aman & permanen."
    : "Foto disimpan di browser ini (localStorage).";
}

function closeAddModal() {
  addModal.classList.add("hidden");
  addModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  photoInput.value = "";
  photoDesc.value = "";
  photoDate.value = "";
  previewImg.src = "";
  previewImg.classList.add("hidden");
  previewPlaceholder.classList.remove("hidden");
  fileDropText.textContent = "Klik atau pilih foto";
  uploadStatus.textContent = USE_CLOUDINARY
    ? "Foto diupload ke cloud, aman & permanen."
    : "Foto disimpan di browser ini (localStorage).";
  addPhotoLabel.textContent = "Simpan ke Galeri";
  addPhotoBtn.disabled = false;
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

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  fileDropText.textContent = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewImg.classList.remove("hidden");
    previewPlaceholder.classList.add("hidden");
  };
  reader.readAsDataURL(file);
});

/** Kompres gambar agar muat di localStorage */
function compressImage(file, maxWidth = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal memproses gambar"));
    };
    img.src = url;
  });
}

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Upload cloud gagal");
  }

  return res.json();
}

async function addPhoto() {
  const file = photoInput.files[0];
  if (!file) {
    alert("Pilih foto dulu ya 💕");
    return;
  }
  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar!");
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    alert("Ukuran foto terlalu besar (maks ~8MB). Coba pilih yang lebih kecil ya 💕");
    return;
  }

  addPhotoBtn.disabled = true;
  addPhotoLabel.textContent = "Menyimpan...";
  uploadStatus.textContent = USE_CLOUDINARY
    ? "Sedang upload ke cloud, tunggu sebentar ☁️"
    : "Sedang memproses foto...";

  try {
    let src;
    let id;

    if (USE_CLOUDINARY) {
      try {
        const result = await uploadToCloudinary(file);
        src = result.secure_url;
        id = result.public_id || "cloud-" + Date.now();
      } catch (cloudErr) {
        console.warn("Cloudinary gagal, fallback lokal:", cloudErr);
        uploadStatus.textContent = "Cloud gagal, menyimpan di browser...";
        src = await compressImage(file);
        id = "local-" + Date.now();
      }
    } else {
      src = await compressImage(file);
      id = "local-" + Date.now();
    }

    const photos = loadLocalPhotos();
    photos.unshift({
      id,
      src,
      desc: photoDesc.value.trim(),
      date: photoDate.value || "",
      local: true,
    });
    saveLocalPhotos(photos);
    renderGallery();
    closeAddModal();
    document.getElementById("gallery").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (err) {
    console.error(err);
    uploadStatus.textContent = "Gagal: " + (err.message || "coba lagi");
    addPhotoLabel.textContent = "Coba Lagi";
    addPhotoBtn.disabled = false;
  }
}

addPhotoBtn.addEventListener("click", addPhoto);

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
    const src = currentLightboxPhoto.src;
    const res = await fetch(src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const name = currentLightboxPhoto.desc
      ? currentLightboxPhoto.desc.replace(/[^a-z0-9]/gi, "_").slice(0, 40)
      : "kenangan";
    link.download = `${name || "foto"}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    const link = document.createElement("a");
    link.href = currentLightboxPhoto.src;
    link.target = "_blank";
    link.download = "foto.jpg";
    link.click();
  }
});

// Init
(async function init() {
  await loadPermanentPhotos();
  renderGallery();
})();
