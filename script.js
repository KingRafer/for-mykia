// ===== Cloudinary =====
const CLOUD_NAME = "djpavitu";
const UPLOAD_PRESET = "for-mykia";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/image/upload";
const USE_CLOUDINARY = true;

// Live gallery API (Vercel serverless → GitHub photos/data.json)
const GALLERY_API = "/api/gallery";
const CACHE_KEY = "saskia_gallery_cache_v2";
const POLL_MS = 12000;

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

// ===== Gallery state =====
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

let livePhotos = [];
let lastFingerprint = "";

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;")
    .replace(/'/g, "&#39;");
}

function optimizedUrl(url, width) {
  width = width || 900;
  if (!url || url.indexOf("res.cloudinary.com") === -1) return url;
  if (url.indexOf("/upload/") === -1) return url;
  if (/\/upload\/[^/]+,[^/]+\//.test(url)) return url;
  return url.replace(
    "/upload/",
    "/upload/c_limit,w_" + width + ",f_auto,q_auto/"
  );
}

function fingerprint(photos) {
  return photos
    .map(function (p) {
      return (p.id || "") + "|" + (p.src || "");
    })
    .join(";");
}

function cacheSave(photos) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ t: Date.now(), photos: photos })
    );
  } catch (e) {}
}

function cacheLoad() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.photos)) return data.photos;
  } catch (e) {}
  return null;
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
  photos = photos || livePhotos;
  livePhotos = photos;
  galleryGrid.innerHTML = "";

  if (!photos.length) {
    galleryGrid.innerHTML =
      '<div class="gallery-empty">Belum ada foto. Yuk tambahkan kenangan pertama! \uD83D\uDCF7\uD83D\uDC95</div>';
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
    const thumb = optimizedUrl(photo.src, 700);
    const full = optimizedUrl(photo.src, 1600);

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
      escapeHtml(thumb) +
      '" alt="' +
      safeAlt +
      '" loading="lazy" decoding="async" />' +
      overlay +
      '<button type="button" class="btn-delete-photo" title="Hapus foto" aria-label="Hapus foto">\u2715</button>' +
      "</div>";

    card.querySelector(".btn-delete-photo").addEventListener("click", function (e) {
      e.stopPropagation();
      deletePhoto(photo);
    });

    card.addEventListener("click", function () {
      openLightbox({
        src: full || photo.src,
        desc: photo.desc,
        date: photo.date,
        id: photo.id,
      });
    });

    frag.appendChild(card);
  });

  galleryGrid.appendChild(frag);
}

async function fetchLivePhotos(opts) {
  opts = opts || {};
  try {
    const res = await fetch(GALLERY_API + "?t=" + Date.now(), {
      cache: "no-store",
    });
    if (!res.ok) {
      const err = await res.json().catch(function () {
        return {};
      });
      throw new Error(err.error || "Gagal memuat galeri (" + res.status + ")");
    }
    const data = await res.json();
    const photos = Array.isArray(data.photos) ? data.photos : [];
    const fp = fingerprint(photos);
    if (opts.force || fp !== lastFingerprint) {
      lastFingerprint = fp;
      cacheSave(photos);
      renderGallery(photos);
    }
    setSyncStatus(true);
    return photos;
  } catch (err) {
    console.warn(err);
    setSyncStatus(false, err.message);
    if (!livePhotos.length) {
      const cached = cacheLoad();
      if (cached) renderGallery(cached);
    }
    return livePhotos;
  }
}

function setSyncStatus(ok, msg) {
  var el = document.getElementById("sync-status");
  if (!el) return;
  if (ok) {
    el.textContent = "\u25CF Live";
    el.className = "sync-status sync-ok";
    el.title = "Galeri tersinkron di semua perangkat";
  } else {
    el.textContent = "\u25CF Offline";
    el.className = "sync-status sync-err";
    el.title = msg || "Tidak bisa sync \u2014 set GITHUB_TOKEN di Vercel";
  }
}

async function savePhotoLive(photo) {
  const res = await fetch(GALLERY_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(photo),
  });
  const data = await res.json().catch(function () {
    return {};
  });
  if (!res.ok) throw new Error(data.error || "Gagal menyimpan ke server");
  if (Array.isArray(data.photos)) {
    lastFingerprint = fingerprint(data.photos);
    cacheSave(data.photos);
    renderGallery(data.photos);
  }
  return data;
}

async function deletePhoto(photo) {
  if (!confirm("Hapus foto ini dari galeri (semua perangkat)?")) return;

  const prev = livePhotos.slice();
  renderGallery(
    livePhotos.filter(function (p) {
      return (p.id || p.src) !== (photo.id || photo.src);
    })
  );

  try {
    const res = await fetch(GALLERY_API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id, src: photo.src }),
    });
    const data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) throw new Error(data.error || "Gagal hapus");
    if (Array.isArray(data.photos)) {
      lastFingerprint = fingerprint(data.photos);
      cacheSave(data.photos);
      renderGallery(data.photos);
    }
  } catch (err) {
    console.error(err);
    renderGallery(prev);
    alert("Gagal hapus: " + (err.message || "coba lagi"));
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
  uploadStatus.textContent = "Foto diupload ke cloud & muncul di semua perangkat.";
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
  uploadStatus.textContent = "Foto diupload ke cloud & muncul di semua perangkat.";
  addPhotoLabel.textContent = "Simpan ke Galeri";
  addPhotoBtn.disabled = false;
}

openAddModalBtn.addEventListener("click", openAddModal);
closeAddModalBtn.addEventListener("click", closeAddModal);
addModal.addEventListener("click", function (e) {
  if (e.target === addModal) closeAddModal();
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeAddModal();
    closeLightbox();
  }
});

photoInput.addEventListener("change", function () {
  const file = photoInput.files[0];
  if (!file || !file.type.startsWith("image/")) return;
  fileDropText.textContent = file.name;
  const reader = new FileReader();
  reader.onload = function (e) {
    previewImg.src = e.target.result;
    previewImg.classList.remove("hidden");
    previewPlaceholder.classList.add("hidden");
  };
  reader.readAsDataURL(file);
});

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "for-kia");

  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json().catch(function () {
      return {};
    });
    throw new Error((err.error && err.error.message) || "Upload cloud gagal");
  }
  return res.json();
}

async function addPhoto() {
  const file = photoInput.files[0];
  if (!file) {
    alert("Pilih foto dulu ya \uD83D\uDC95");
    return;
  }
  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar!");
    return;
  }
  if (file.size > 12 * 1024 * 1024) {
    alert("Ukuran foto terlalu besar (maks ~12MB).");
    return;
  }

  addPhotoBtn.disabled = true;
  addPhotoLabel.textContent = "Mengupload...";
  uploadStatus.textContent = "Upload ke Cloudinary...";

  try {
    const result = await uploadToCloudinary(file);
    const photo = {
      id: result.public_id || "cloud-" + Date.now(),
      src: result.secure_url,
      desc: photoDesc.value.trim(),
      date: photoDate.value || "",
    };

    renderGallery([photo].concat(livePhotos));
    uploadStatus.textContent = "Menyimpan ke galeri live...";

    await savePhotoLive(photo);
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
    fetchLivePhotos({ force: true });
  }
}

addPhotoBtn.addEventListener("click", addPhoto);

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

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", function (e) {
  if (e.target === lightbox) closeLightbox();
});

downloadBtn.addEventListener("click", async function (e) {
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
    link.download = (name || "foto") + ".jpg";
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

function startLiveSync() {
  setInterval(function () {
    if (!document.hidden) fetchLivePhotos();
  }, POLL_MS);

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) fetchLivePhotos();
  });

  window.addEventListener("focus", function () {
    fetchLivePhotos();
  });
}

(function init() {
  const cached = cacheLoad();
  if (cached && cached.length) {
    livePhotos = cached;
    lastFingerprint = fingerprint(cached);
    renderGallery(cached);
  } else {
    renderGallery([]);
  }
  fetchLivePhotos({ force: true });
  startLiveSync();
})();
