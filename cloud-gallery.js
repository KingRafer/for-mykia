/* Shared cloud gallery — Supabase
   Isi SUPABASE_URL dan SUPABASE_ANON_KEY setelah membuat project Supabase.
   Jangan pernah menaruh service_role key di file frontend.
*/
(() => {
  const SUPABASE_URL = "https://ssckyiznqzgxdplxffxl.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_OAVh0TIQLHwnQ2hnM2srLA_oowt7ZB6";
  const BUCKET = "memory-photos";

  const loginForm = document.getElementById("gallery-login-form");
  const uploadForm = document.getElementById("gallery-upload-form");
  const statusEl = document.getElementById("gallery-status");
  const logoutBtn = document.getElementById("gallery-logout");
  const fileInput = document.getElementById("gallery-file");
  const descInput = document.getElementById("gallery-desc");
  const dateInput = document.getElementById("gallery-date");

  const configured =
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("ISI_") &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes("ISI_");

  function status(message, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle("sync-err", isError);
    statusEl.classList.toggle("sync-ok", !isError);
  }

  if (!configured || !window.supabase) {
    status("Galeri cloud belum dikonfigurasi. Isi URL dan anon key Supabase di cloud-gallery.js, lalu jalankan SQL pada supabase-setup.sql.");
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  async function refreshGallery() {
    const { data, error } = await client
      .from("gallery_photos")
      .select("id, storage_path, description, photo_date, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      status("Gagal memuat galeri: " + error.message, true);
      return;
    }

    const photos = (data || []).map((item) => {
      const { data: publicData } = client.storage
        .from(BUCKET)
        .getPublicUrl(item.storage_path);

      return {
        id: item.id,
        src: publicData.publicUrl,
        desc: item.description || "",
        date: item.photo_date || ""
      };
    });

    if (typeof window.renderGallery === "function") {
      window.renderGallery(photos);
    }
    status("Galeri tersinkronisasi. Foto yang sama tampil di semua perangkat.");
  }

  async function updateAuthUI() {
    const { data: { session }, error } = await client.auth.getSession();
    if (error) status("Tidak dapat memeriksa sesi: " + error.message, true);

    const loggedIn = Boolean(session);
    loginForm?.classList.toggle("hidden", loggedIn);
    uploadForm?.classList.toggle("hidden", !loggedIn);
    if (loggedIn) status("Masuk sebagai " + session.user.email);
    return session;
  }

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("gallery-email").value.trim();
    const password = document.getElementById("gallery-password").value;
    const submit = loginForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    status("Sedang masuk...");

    const { error } = await client.auth.signInWithPassword({ email, password });
    submit.disabled = false;

    if (error) {
      status("Login gagal: " + error.message, true);
      return;
    }
    await updateAuthUI();
  });

  uploadForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = fileInput.files?.[0];
    if (!file) {
      status("Pilih foto terlebih dahulu.", true);
      return;
    }
    if (!file.type.startsWith("image/")) {
      status("File harus berupa gambar.", true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      status("Ukuran foto maksimal 5 MB.", true);
      return;
    }

    const submit = uploadForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    status("Mengunggah foto ke cloud...");

    const extension = (file.name.split(".").pop() || "jpg")
      .toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = new Date().toISOString().slice(0, 10) + "/" +
      crypto.randomUUID() + "." + extension;

    const { error: uploadError } = await client.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      submit.disabled = false;
      status("Upload gagal: " + uploadError.message, true);
      return;
    }

    const { error: insertError } = await client
      .from("gallery_photos")
      .insert({
        storage_path: path,
        description: descInput.value.trim(),
        photo_date: dateInput.value || null
      });

    if (insertError) {
      await client.storage.from(BUCKET).remove([path]);
      submit.disabled = false;
      status("Foto terunggah tetapi gagal disimpan ke galeri: " + insertError.message, true);
      return;
    }

    uploadForm.reset();
    submit.disabled = false;
    await refreshGallery();
    status("Foto berhasil diunggah dan dapat dilihat di semua perangkat.");
  });

  logoutBtn?.addEventListener("click", async () => {
    const { error } = await client.auth.signOut();
    if (error) status("Gagal keluar: " + error.message, true);
    else {
      await updateAuthUI();
      status("Anda sudah keluar.");
    }
  });

  client.auth.onAuthStateChange(() => {
    updateAuthUI();
  });

  refreshGallery();
  updateAuthUI();

  // Pembaruan otomatis di perangkat yang sedang membuka website.
  client.channel("gallery-live-updates")
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "gallery_photos"
    }, refreshGallery)
    .subscribe();
})();
