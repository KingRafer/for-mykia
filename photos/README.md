# Folder Foto

Foto permanen galeri disimpan di sini (terlihat oleh semua pengunjung).

## Cara menambah foto permanen

1. Upload file foto ke folder ini (misal: `foto-pantai.jpg`)
2. Buka file `data.json`
3. Tambahkan entri baru di array, contoh:

```json
[
  {
    "src": "photos/foto-pantai.jpg",
    "desc": "Jalan sore di pantai",
    "date": "2026-10-20"
  }
]
```

- `desc` boleh dikosongkan: `"desc": ""`
- `date` format: `YYYY-MM-DD`, boleh dikosongkan: `"date": ""`

4. Commit & push → GitHub Pages otomatis update

## Catatan

- Pakai nama file tanpa spasi (pakai `-` atau `_`)
- Format: `.jpg`, `.jpeg`, `.png`, `.webp`
- Foto yang ditambahkan lewat tombol di website disimpan di browser pengunjung (localStorage), bukan di folder ini
