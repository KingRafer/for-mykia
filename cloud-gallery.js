/* Shared cloud gallery — Supabase public upload (no login).
   Gunakan hanya publishable key di frontend. Jangan pernah menaruh secret key di sini.
*/
(() => {
  const SUPABASE_URL = "https://ssckyiznqzgxdplxffxl.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_OAVh0TIQLHwnQ2hnM2srLA_oowt7ZB6";
  const BUCKET = "memory-photos";
  const uploadForm = document.getElementById("gallery-upload-form");
  const statusEl = document.getElementById("gallery-status");
  const fileInput = document.getElementById("gallery-file");
  const descInput = document.getElementById("gallery-desc");
  const dateInput = document.getElementById("gallery-date");

  function status(message, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle("sync-err", isError);
    statusEl.classList.toggle("sync-ok", !isError);
  }

  if (!window.supabase || !SUPABASE_URL.startsWith("https://") || !SUPABASE_ANON_KEY.startsWith("sb_publishable_")) {
    status("Konfigurasi Supabase belum lengkap.", true);
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  async function refreshGallery() {
    const { data, error } = await client.from("gallery_photos")
      .select("id, storage_path, description, photo_date, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      status("Gagal memuat galeri: " + error.message, true);
      return;
    }
    const photos = (data || []).map((item) => {
      const { data: publicData } = client.storage.from(BUCKET).getPublicUrl(item.storage_path);
      return { id: item.id, src: publicData.publicUrl, desc: item.description || "", date: item.photo_date || "" };
    });
    if (typeof window.renderGallery === "function") window.renderGallery(photos);
    status("Galeri tersinkronisasi. Foto tampil di semua perangkat.");
  }

  uploadForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = fileInput.files?.[0];
    if (!file) return status("Pilih foto terlebih dahulu.", true);
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      return status("Format yang didukung: JPG, PNG, WEBP, atau GIF.", true);
    }
    if (file.size > 5 * 1024 * 1024) return status("Ukuran foto maksimal 5 MB.", true);

    const submit = uploadForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    status("Mengunggah foto ke cloud...");
    try {
      const extension = file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = new Date().toISOString().slice(0, 10) + "/" + crypto.randomUUID() + "." + extension;
      const { error: uploadError } = await client.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type
      });
      if (uploadError) throw uploadError;

      const { error: insertError } = await client.from("gallery_photos").insert({
        storage_path: path,
        description: descInput.value.trim(),
        photo_date: dateInput.value || null
      });
      if (insertError) {
        await client.storage.from(BUCKET).remove([path]);
        throw insertError;
      }
      uploadForm.reset();
      await refreshGallery();
      status("Foto berhasil diunggah dan dapat dilihat dari perangkat lain.");
    } catch (error) {
      status("Upload gagal: " + (error.message || "Terjadi kesalahan."), true);
    } finally {
      submit.disabled = false;
    }
  });

  refreshGallery();
  client.channel("gallery-live-updates")
    .on("postgres_changes", { event: "*", schema: "public", table: "gallery_photos" }, refreshGallery)
    .subscribe();
})();
