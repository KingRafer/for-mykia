/**
 * Live gallery API — baca/tulis photos/data.json di GitHub.
 * Wajib set env di Vercel: GITHUB_TOKEN (PAT dengan scope "repo")
 */

const OWNER = "KingRafer";
const REPO = "for-mykia";
const PATH = "photos/data.json";
const BRANCH = "main";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store, max-age=0");
}

async function github(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const err = new Error("GITHUB_TOKEN belum di-set di Vercel Environment Variables");
    err.status = 503;
    throw err;
  }
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return res;
}

async function readGallery() {
  const res = await github(
    `/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`
  );
  if (res.status === 404) {
    return { photos: [], sha: null };
  }
  if (!res.ok) {
    const t = await res.text();
    const err = new Error("Gagal baca gallery: " + t);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf8");
  let photos = [];
  try {
    photos = JSON.parse(content);
    if (!Array.isArray(photos)) photos = [];
  } catch {
    photos = [];
  }
  return { photos, sha: data.sha };
}

async function writeGallery(photos, sha, message) {
  const body = {
    message: message || "Update gallery",
    content: Buffer.from(JSON.stringify(photos, null, 2) + "\n").toString(
      "base64"
    ),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await github(`/repos/${OWNER}/${REPO}/contents/${PATH}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    if (res.status === 409) {
      const latest = await readGallery();
      return { conflict: true, latest };
    }
    const err = new Error("Gagal simpan gallery: " + t);
    err.status = res.status;
    throw err;
  }
  return { ok: true, data: await res.json() };
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (req.method === "GET") {
      const { photos } = await readGallery();
      return res.status(200).json({ photos });
    }

    if (req.method === "POST") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const { src, desc, date, id } = body;
      if (!src || typeof src !== "string") {
        return res.status(400).json({ error: "src wajib diisi" });
      }

      let { photos, sha } = await readGallery();
      const photo = {
        id: id || "p-" + Date.now(),
        src,
        desc: (desc || "").toString().slice(0, 200),
        date: (date || "").toString().slice(0, 32),
      };
      photos = [photo, ...photos.filter((p) => p.id !== photo.id && p.src !== photo.src)];
      photos = photos.slice(0, 200);

      let result = await writeGallery(
        photos,
        sha,
        `Galeri: tambah foto ${photo.id}`
      );
      if (result.conflict) {
        photos = [
          photo,
          ...result.latest.photos.filter(
            (p) => p.id !== photo.id && p.src !== photo.src
          ),
        ].slice(0, 200);
        result = await writeGallery(
          photos,
          result.latest.sha,
          `Galeri: tambah foto ${photo.id} (retry)`
        );
      }
      return res.status(200).json({ ok: true, photo, photos });
    }

    if (req.method === "DELETE") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const { id, src } = body;
      if (!id && !src) {
        return res.status(400).json({ error: "id atau src wajib" });
      }

      let { photos, sha } = await readGallery();
      const next = photos.filter(
        (p) => ((id && p.id === id) || (src && p.src === src) ? false : true)
      );
      if (next.length === photos.length) {
        return res.status(404).json({ error: "Foto tidak ditemukan" });
      }

      let result = await writeGallery(next, sha, `Galeri: hapus foto`);
      if (result.conflict) {
        const filtered = result.latest.photos.filter(
          (p) => ((id && p.id === id) || (src && p.src === src) ? false : true)
        );
        result = await writeGallery(
          filtered,
          result.latest.sha,
          `Galeri: hapus foto (retry)`
        );
        return res.status(200).json({ ok: true, photos: filtered });
      }
      return res.status(200).json({ ok: true, photos: next });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({
      error: err.message || "Server error",
    });
  }
};
