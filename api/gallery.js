const OWNER = process.env.GITHUB_OWNER || "KingRafer";
const REPO = process.env.GITHUB_REPO || "for-mykia";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN;
const UPLOAD_PASSWORD = process.env.GALLERY_UPLOAD_PASSWORD;
const crypto = require("crypto");
const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";

function headers() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: "Bearer " + TOKEN,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json"
  };
}
async function github(path, options = {}) {
  const response = await fetch(API + path, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "GitHub API request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}
function rawUrl(path) {
  return RAW + "/" + OWNER + "/" + REPO + "/" + BRANCH + "/" + path.split("/").map(encodeURIComponent).join("/");
}
function respond(res, status, body) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(status).json(body);
}
function passwordMatches(candidate) {
  if (typeof candidate !== "string" || !UPLOAD_PASSWORD) return false;
  const expected = crypto.createHash("sha256").update(UPLOAD_PASSWORD, "utf8").digest();
  const actual = crypto.createHash("sha256").update(candidate, "utf8").digest();
  return crypto.timingSafeEqual(expected, actual);
}
async function getGallery() {
  const photos = [];
  try {
    const old = await fetch(rawUrl("photos/data.json"), { cache: "no-store" });
    if (old.ok) {
      const items = await old.json();
      if (Array.isArray(items)) photos.push(...items);
    }
  } catch (_) {}
  let files;
  try {
    files = await github("/repos/" + OWNER + "/" + REPO + "/contents/photos/uploads?ref=" + encodeURIComponent(BRANCH));
  } catch (error) {
    if (error.status === 404) return photos;
    throw error;
  }
  if (!Array.isArray(files)) return photos;
  const imageFiles = files.filter(file => file.type === "file" && /\.(jpe?g|png|webp|gif)$/i.test(file.name));
  const uploaded = await Promise.all(imageFiles.map(async file => {
    const sidecar = files.find(item => item.name === file.name + ".json");
    let meta = {};
    if (sidecar && sidecar.download_url) {
      try {
        const response = await fetch(sidecar.download_url, { cache: "no-store" });
        if (response.ok) meta = await response.json();
      } catch (_) {}
    }
    return {
      id: file.name,
      src: rawUrl(file.path),
      desc: typeof meta.description === "string" ? meta.description : "",
      date: typeof meta.date === "string" ? meta.date : ""
    };
  }));
  photos.push(...uploaded);
  return photos;
}
function validImage(buffer, mime) {
  if (mime === "image/jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === "image/png") return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (mime === "image/gif") return buffer.subarray(0, 6).toString("ascii").startsWith("GIF8");
  if (mime === "image/webp") return buffer.length > 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}
module.exports = async function handler(req, res) {
  if (!TOKEN) return respond(res, 500, { error: "Tambahkan GITHUB_TOKEN di Vercel Environment Variables." });
  try {
    if (req.method === "GET") return respond(res, 200, { photos: await getGallery() });
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return respond(res, 405, { error: "Method tidak diizinkan." });
    }
    if (!UPLOAD_PASSWORD) return respond(res, 500, { error: "Admin belum mengatur GALLERY_UPLOAD_PASSWORD di Vercel." });
    const body = req.body || {};
    if (!passwordMatches(body.uploadPassword)) return respond(res, 401, { error: "Kata sandi upload salah." });
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(body.mimeType) || typeof body.contentBase64 !== "string") {
      return respond(res, 400, { error: "File gambar tidak valid." });
    }
    const base64 = body.contentBase64.replace(/^data:[^;]+;base64,/, "");
    if (base64.length > 4 * 1024 * 1024) return respond(res, 413, { error: "Ukuran foto maksimal 3 MB." });
    const buffer = Buffer.from(base64, "base64");
    if (!buffer.length || buffer.length > 3 * 1024 * 1024 || !validImage(buffer, body.mimeType)) {
      return respond(res, 400, { error: "File bukan gambar valid atau ukurannya melebihi 3 MB." });
    }
    const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" })[body.mimeType];
    const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : "";
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 180) : "";
    const id = new Date().toISOString().replace(/[:.]/g, "-") + "-" + crypto.randomUUID();
    const path = "photos/uploads/" + id + "." + extension;
    await github("/repos/" + OWNER + "/" + REPO + "/contents/" + path.split("/").map(encodeURIComponent).join("/"), {
      method: "PUT",
      body: JSON.stringify({ message: "Add gallery photo", content: buffer.toString("base64"), branch: BRANCH })
    });
    const metadataPath = path + ".json";
    await github("/repos/" + OWNER + "/" + REPO + "/contents/" + metadataPath.split("/").map(encodeURIComponent).join("/"), {
      method: "PUT",
      body: JSON.stringify({
        message: "Add gallery photo metadata",
        content: Buffer.from(JSON.stringify({ description, date }, null, 2)).toString("base64"),
        branch: BRANCH
      })
    });
    return respond(res, 201, { photo: { id, src: rawUrl(path), desc: description, date } });
  } catch (error) {
    console.error("Gallery API error:", error);
    const message = error.status === 401 || error.status === 403
      ? "GitHub menolak akses. Periksa token dan izin Contents: Read and write."
      : "Gagal mengakses GitHub. Periksa konfigurasi Vercel dan coba lagi.";
    return respond(res, error.status && error.status < 500 ? error.status : 500, { error: message });
  }
};