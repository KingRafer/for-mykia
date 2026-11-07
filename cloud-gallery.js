/* Galeri bersama: foto disimpan di repository GitHub melalui Vercel API. */
(() => {
  const form = document.getElementById("gallery-upload-form");
  const statusEl = document.getElementById("gallery-status");
  const fileInput = document.getElementById("gallery-file");
  const descInput = document.getElementById("gallery-desc");
  const dateInput = document.getElementById("gallery-date");
  const passwordInput = document.getElementById("gallery-password");
  const uploadModal = document.getElementById("upload-modal");
  const openUploadButton = document.getElementById("open-upload-modal");
  const closeUploadButton = document.getElementById("close-upload-modal");
  const deleteModal = document.getElementById("delete-photo-modal");
  const deleteForm = document.getElementById("delete-photo-form");
  const deletePasswordInput = document.getElementById("delete-photo-password");
  const deleteStatus = document.getElementById("delete-photo-status");
  const cancelDeleteButtons = [
    document.getElementById("cancel-delete-photo"),
    document.getElementById("cancel-delete-photo-secondary")
  ];
  let selectedPhotoId = null;

  function closeDeleteModal() {
    if (!deleteModal) return;
    deleteModal.classList.add("hidden");
    deleteModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    deleteForm?.reset();
    if (deleteStatus) deleteStatus.textContent = "";
    selectedPhotoId = null;
  }

  window.requestPhotoDeletion = function (photoId) {
    selectedPhotoId = photoId;
    if (!deleteModal) return;
    deleteModal.classList.remove("hidden");
    deleteModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    deletePasswordInput?.focus();
  };

  cancelDeleteButtons.forEach(button => button?.addEventListener("click", closeDeleteModal));
  deleteModal?.addEventListener("click", event => {
    if (event.target === deleteModal) closeDeleteModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && deleteModal && !deleteModal.classList.contains("hidden")) {
      closeDeleteModal();
    }
  });

  deleteForm?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!selectedPhotoId) return;
    const button = deleteForm.querySelector('button[type="submit"]');
    button.disabled = true;
    if (deleteStatus) deleteStatus.textContent = "Menghapus foto...";
    try {
      const response = await fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPhotoId,
          uploadPassword: deletePasswordInput.value
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Foto gagal dihapus.");
      closeDeleteModal();
      await refreshGallery();
      status("Foto berhasil dihapus dari galeri.");
    } catch (error) {
      if (deleteStatus) deleteStatus.textContent = error.message || "Foto gagal dihapus.";
    } finally {
      button.disabled = false;
    }
  });

  function openUploadModal() {
    if (!uploadModal) return;
    uploadModal.classList.remove("hidden");
    uploadModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeUploadButton?.focus();
  }

  function closeUploadModal() {
    if (!uploadModal) return;
    uploadModal.classList.add("hidden");
    uploadModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    openUploadButton?.focus();
  }

  openUploadButton?.addEventListener("click", openUploadModal);
  closeUploadButton?.addEventListener("click", closeUploadModal);
  uploadModal?.addEventListener("click", event => {
    if (event.target === uploadModal) closeUploadModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && uploadModal && !uploadModal.classList.contains("hidden")) {
      closeUploadModal();
    }
  });

  function status(message, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle("sync-err", isError);
    statusEl.classList.toggle("sync-ok", !isError);
  }

  async function refreshGallery() {
    try {
      const response = await fetch("/api/gallery", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal memuat galeri.");
      if (typeof window.renderGallery === "function") window.renderGallery(result.photos || []);
      status("Galeri tersinkronisasi dari GitHub.");
    } catch (error) {
      status(error.message || "Gagal memuat galeri.", true);
    }
  }

  form?.addEventListener("submit", async event => {
    event.preventDefault();
    const file = fileInput.files && fileInput.files[0];
    if (!file) return status("Pilih foto terlebih dahulu.", true);
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      return status("Format yang didukung: JPG, PNG, WEBP, atau GIF.", true);
    }
    if (file.size > 3 * 1024 * 1024) return status("Ukuran foto maksimal 3 MB.", true);

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status("Mengunggah foto ke GitHub...");
    try {
      const contentBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
        reader.onerror = () => reject(new Error("Foto gagal dibaca."));
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentBase64,
          mimeType: file.type,
          description: descInput.value.trim(),
          date: dateInput.value,
          uploadPassword: passwordInput.value
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload gagal.");

      form.reset();
      closeUploadModal();
      await refreshGallery();
      status("Foto berhasil disimpan ke GitHub dan tampil untuk semua perangkat.");
    } catch (error) {
      status("Upload gagal: " + (error.message || "Terjadi kesalahan."), true);
    } finally {
      button.disabled = false;
    }
  });

  refreshGallery();
})();