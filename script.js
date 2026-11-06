// ===== Cloudinary =====
const CLOUD_NAME = "djpavitu";
const UPLOAD_PRESET = "for-mykia";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/image/upload";

// Daftar foto bersama di repo
const DATA_URL = "photos/data.json";
const LOCAL_KEY = "saskia_gallery_local_v3";

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
const photoInput = document.getElementById("photo-input");
const photoDesc = document.getElementById("photo-desc");
const photoDate = document.getElementById("photo-date");
const addPhotoBtn = document.getElementById("add-photo-btn");
const addPhotoLabel = document.getElementById("add-photo-label");
const uploadStatus = document.getElementById("upload-status");
const previewImg = document.getElementById("preview-img");
const previewPlaceholder = document.getElementById("preview-placeholder");
const fileDropText = document.getElementById("file-drop-text");

let repoPhotos = [];
let localPhotos = [];

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
  return url.replace("/upload/", "/upload/c_limit,w_" + width + ",f_auto,q_auto/");
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) {}
  return [];
}

function saveLocal(arr) {
  localPhotos = arr;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(arr));
  } catch (e) {}
}

function allPhotos() {
  const map = new Map();
  repoPhotos.forEach(function (p) {
    map.set(p.id || p.src, Object.assign({ fromRepo: true }, p));
  });
  localPhotos.forEach(function (p) {
    map.set(p.id || p.src, Object.assign({ fromRepo: false }, p));
  });
  return Array.from(map.values()).sort(function (a, b) {
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
  const photos = allPhotos();
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
    const del =
      !photo.fromRepo
        ? '<button type="button" class="btn-delete-photo" title="Hapus" aria-label="Hapus">\u2715</button>'
        : "";
    card.innerHTML =
      '<div class="gallery-media">' +
      '<img src="' +
      escapeHtml(thumb) +
      '" alt="' +
      safeAlt +
      '" loading="lazy" decoding="async" />' +
      overlay +
      del +
      "</div>";
    const delBtn = card.querySelector(".btn-delete-photo");
    if (delBtn) {
      delBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!confirm("Hapus foto ini?")) return;
        saveLocal(
          localPhotos.filter(function (p) {
            return (p.id || p.src) !== (photo.id || photo.src);
          })
        );
        renderGallery();
      });
    }
    card.addEventListener("click", function () {
      openLightbox({
        src: full || photo.src,
        desc: photo.desc,
        date: photo.date,
      });
    });
    frag.appendChild(card);
  });
  galleryGrid.appendChild(frag);
}

async function loadRepoPhotos() {
  try {
    const res = await fetch(DATA_URL + "?t=" + Date.now(), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) {
      repoPhotos = data.map(function (p, i) {
        return {
          id: p.id || "repo-" + i,
          src: p.src,
          desc: p.desc || "",
          date: p.date || "",
        };
      });
    }
  } catch (e) {
    console.warn("data.json belum ada / gagal dimuat", e);
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
  uploadStatus.textContent = "Foto diupload ke cloud, lalu masuk galeri.";
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
  uploadStatus.textContent = "Foto diupload ke cloud, lalu masuk galeri.";
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
    throw new Error((err.error && err.error.message) || "Upload gagal");
  }
  return res.json();
}

async function publishToRepo(photo) {
  const token = localStorage.getItem("GH_TOKEN");
  if (!token) return { published: false, reason: "no-token" };

  const owner = "KingRafer";
  const repo = "for-mykia";
  const path = "photos/data.json";

  const getRes = await fetch(
    "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + path,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
      },
    }
  );

  let current = [];
  let sha = null;
  if (getRes.ok) {
    const meta = await getRes.json();
    sha = meta.sha;
    try {
      current = JSON.parse(atob(meta.content.replace(/\n/g, "")));
      if (!Array.isArray(current)) current = [];
    } catch (e) {
      current = [];
    }
  } else if (getRes.status !== 404) {
    throw new Error("Gagal baca data.json");
  }

  const entry = {
    id: photo.id,
    src: photo.src,
    desc: photo.desc || "",
    date: photo.date || "",
  };
  const next = [entry].concat(
    current.filter(function (p) {
      return p.id !== entry.id && p.src !== entry.src;
    })
  ).slice(0, 200);

  const body = {
    message: "Galeri: tambah foto",
    content: btoa(unescape(encodeURIComponent(JSON.stringify(next, null, 2) + "\n"))),
    branch: "main",
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(
    "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + path,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!putRes.ok) {
    const t = await putRes.text();
    throw new Error("Gagal simpan ke repo: " + t.slice(0, 120));
  }
  repoPhotos = next;
  return { published: true };
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

    saveLocal([photo].concat(localPhotos));
    renderGallery();

    uploadStatus.textContent = "Menyimpan ke repo...";
    try {
      const pub = await publishToRepo(photo);
      if (pub.published) {
        saveLocal(
          localPhotos.filter(function (p) {
            return (p.id || p.src) !== (photo.id || photo.src);
          })
        );
        uploadStatus.textContent = "Tersimpan di repo \u2713";
      } else {
        uploadStatus.textContent =
          "Tersimpan di perangkat ini. (Opsional: set token agar masuk repo)";
      }
    } catch (pubErr) {
      console.warn(pubErr);
      uploadStatus.textContent =
        "Cloud OK. Repo: " + (pubErr.message || "skip");
    }

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
    link.download = "foto.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    window.open(currentLightboxPhoto.src, "_blank");
  }
});

window.setGithubToken = function (token) {
  if (!token) {
    localStorage.removeItem("GH_TOKEN");
    alert("Token dihapus");
    return;
  }
  localStorage.setItem("GH_TOKEN", token.trim());
  alert("Token tersimpan. Upload berikutnya masuk ke photos/data.json di repo.");
};

(async function init() {
  localPhotos = loadLocal();
  await loadRepoPhotos();
  renderGallery();
})();
