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

## Cara pakai Galeri

1. Klik **Tambah Kenangan**
2. Pilih foto dari HP/laptop
3. Isi deskripsi & tanggal (opsional)
4. Klik **Simpan ke Galeri**

Foto yang ditambahkan lewat tombol disimpan di **localStorage** browser (otomatis dikompres).

### Foto permanen (semua orang bisa lihat)

1. Upload file foto ke folder `photos/` (misal: `foto-pantai.jpg`)
2. Edit `photos/data.json`, contoh:

```json
[
  {
    "src": "photos/foto-pantai.jpg",
    "desc": "Jalan sore di pantai",
    "date": "2026-10-20"
  }
]
```

3. Commit & push → GitHub Pages otomatis update

### Cloudinary (opsional)

Kalau mau upload langsung ke cloud:

1. Buat akun [Cloudinary](https://cloudinary.com)
2. Settings → Upload → Add upload preset → mode **Unsigned**
3. Di `script.js`, isi:

```js
const CLOUD_NAME = "nama_cloud_kamu";
const UPLOAD_PRESET = "nama_preset_unsigned";
```

Kalau preset salah/kosong, sistem otomatis simpan di browser.

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
