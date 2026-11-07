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
| 🔐 Proteksi upload | Unggah foto memerlukan kata sandi khusus; galeri tetap publik |
| ✨ Sticker & logo | Dekorasi aesthetic di seluruh halaman |
| 📱 Responsive | Nyaman di HP & desktop |

## Galeri foto lintas perangkat (GitHub + Vercel)

Foto yang diunggah disimpan langsung di repository GitHub pada folder `photos/uploads/`. Endpoint `api/gallery.js` menjadi perantara agar token GitHub tidak pernah dikirim ke browser.

### Pengaturan Vercel satu kali

1. Buat GitHub Personal Access Token (Fine-grained) khusus untuk repository ini.
2. Beri izin **Contents: Read and write** saja.
3. Di Vercel, buka project → **Settings → Environment Variables**.
4. Tambahkan:
   - `GITHUB_TOKEN` = token GitHub (rahasia)
   - `GITHUB_OWNER` = `KingRafer`
   - `GITHUB_REPO` = `for-mykia`
   - `GITHUB_BRANCH` = `main`
   - `GALLERY_UPLOAD_PASSWORD` = kata sandi rahasia untuk mengunggah foto (buat sendiri, minimal 16 karakter)
5. Pilih environment Production, simpan, lalu lakukan Redeploy.

**Jangan pernah menaruh GITHUB_TOKEN di file HTML/JS, repository, atau membagikannya lewat chat.** Jika token pernah terlanjur dibagikan, revoke dan buat token baru.

### Cara menggunakan

1. Semua pengunjung dapat melihat galeri tanpa kata sandi.
2. Untuk mengunggah, masukkan `GALLERY_UPLOAD_PASSWORD` yang sudah disimpan di Vercel.
3. Pilih foto (maksimal 3 MB; JPG, PNG, WEBP, atau GIF), isi cerita/tanggal bila perlu, lalu tekan **Upload ke Galeri**.
4. Foto dan metadata disimpan di folder `photos/uploads/` dan tampil pada perangkat lain.

Kata sandi diperiksa di server dan tidak disimpan di file HTML/JavaScript. Jangan bagikan kata sandi secara publik. Setiap unggahan membuat commit baru di repository. Proteksi kata sandi bukan pengganti pembatasan laju unggahan; bila kata sandi tersebar, segera ganti nilai `GALLERY_UPLOAD_PASSWORD` di Vercel lalu redeploy.

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
