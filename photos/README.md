# Folder Foto

Semua foto galeri disimpan di sini (permanen di repo).

## Cara menambah foto

1. Upload file foto ke folder ini (misal: `foto-pantai.jpg`)
2. Buka file `data.json`
3. Tambahkan entri baru di array, contoh:

```json
{
  "src": "photos/foto-pantai.jpg",
  "desc": "Jalan sore di pantai",
  "date": "2026-10-20"
}
```

- `desc` boleh dikosongkan: `"desc": ""`
- `date` format: `YYYY-MM-DD`, boleh dikosongkan: `"date": ""`

4. Commit & push → Vercel otomatis update

## Catatan

- Pakai nama file tanpa spasi (pakai `-` atau `_`)
- Format: `.jpg`, `.jpeg`, `.png`, `.webp`
