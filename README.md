# 💕 Untuk Saskia Ramadani

**Hadiah spesial dari Rafer**

Website couple yang dibuat khusus untuk **Saskia Ramadani**.

- Tema terang: pastel vibrant (pink, ungu, cyan, gold)
- Tema gelap: midnight vibrant
- Tanggal jadian: **17 Oktober 2026**

## Fitur

| Fitur | Keterangan |
|-------|------------|
| 🎨 Toggle tema | Light pastel ↔ Dark midnight |
| ⏳ Countdown live | Menghitung hari bersama secara real-time |
| 🎵 Musik | Play/pause background music |
| 📷 Galeri foto | Tambah foto + deskripsi + tanggal |
| 🔍 Lightbox | Klik foto untuk lihat lebih besar + download |
| 🗑️ Hapus foto | Hapus foto yang ditambahkan dari browser |
| ✨ Sticker & logo | Dekorasi aesthetic di seluruh halaman |
| 📱 Responsive | Nyaman di HP & desktop |

## Galeri foto lintas perangkat (Supabase)

Galeri menggunakan Supabase Storage untuk file foto dan tabel database untuk metadata. Foto yang berhasil diunggah akan tampil di semua perangkat yang membuka website, bukan hanya browser pengunggah.

### Pengaturan satu kali

1. Buat project Supabase dan tunggu sampai project siap.
2. Buka **SQL Editor**, salin seluruh isi file `supabase-setup.sql`, lalu jalankan.
3. Buka **Authentication → Users** dan buat satu akun email/password khusus pengelola galeri. Jangan aktifkan pendaftaran publik jika hanya pengelola yang boleh mengunggah.
4. Buka **Project Settings → API**. Salin **Project URL** dan **anon/public key**.
5. Buka `cloud-gallery.js` di GitHub. Ganti `ISI_SUPABASE_PROJECT_URL` dan `ISI_SUPABASE_ANON_KEY` dengan nilai project milikmu.
6. Simpan perubahan. Jika Vercel terhubung ke GitHub, tunggu deployment selesai.

**Penting:** gunakan hanya anon/public key di frontend. Jangan pernah memasukkan `service_role` key atau password akun ke dalam file website.

### Cara menggunakan

1. Buka website dan masuk menggunakan akun pengelola.
2. Pilih foto (maksimal 5 MB), isi cerita/tanggal bila perlu, lalu tekan **Upload ke Galeri**.
3. Pengunjung lain dapat melihat foto tanpa login. Untuk mengunggah, perlu akun pengelola.
4. Perangkat yang sedang membuka website akan menerima pembaruan galeri otomatis; perangkat lain akan memuat foto terbaru saat halaman dibuka atau dimuat ulang.

File foto lama yang hanya ada di folder browser/localStorage tidak otomatis dipindahkan ke cloud. Unggah ulang foto tersebut setelah konfigurasi selesai, atau tambahkan secara manual ke bucket dan tabel Supabase.

## Ganti Musik

Di `index.html`, cari tag `<audio>` dan ganti `src` dengan link MP3 lagu favorit kalian.

## Deploy GitHub Pages

1. Repo → **Settings** → **Pages**
2. Source: Deploy from a branch
3. Branch: `main` / root
4. Save

Live di: **https://kingrafer.github.io/for-mykia/**

---

Dibuat dengan 💖 oleh **Rafer**  
Khusus untuk **Saskia Ramadani**  
17.10.2026 — Forever
