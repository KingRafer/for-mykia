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
5. Pilih environment Production, simpan, lalu lakukan Redeploy.

**Jangan pernah menaruh GITHUB_TOKEN di file HTML/JS, repository, atau membagikannya lewat chat.** Jika token pernah terlanjur dibagikan, revoke dan buat token baru.

### Cara menggunakan

1. Buka website dan pilih foto (maksimal 3 MB; JPG, PNG, WEBP, atau GIF).
2. Isi cerita/tanggal bila perlu, lalu tekan **Upload ke Galeri**.
3. Foto dan metadata disimpan di folder `photos/uploads/` dan akan tampil pada perangkat lain.

Catatan: form ini terbuka untuk siapa pun yang mengunjungi website. Setiap upload membuat commit baru di repository, jadi batasi ukuran foto dan pantau penggunaan repository.

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
