const BASE_URL = import.meta.env.BASE_URL || "/";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

let apiOrigin = "";
try {
  apiOrigin = new URL(API_BASE_URL).origin;
} catch {
  apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || apiOrigin || API_BASE_URL)
  .replace(/\/$/, "");

const STORAGE_BASE_URL = API_ORIGIN.replace(/\/$/, "");

const isAbsoluteUrl = (value) =>
  /^https?:\/\//i.test(value) || /^data:/i.test(value);

export const publicUrl = (path = "") => {
  const cleanPath = String(path).replace(/^\/+/, "");
  return `${BASE_URL}${cleanPath}`;
};

const normalizeStoragePath = (value) => {
  const raw = String(value || "");
  if (!raw) return "";
  if (raw.startsWith("/storage/") || raw.startsWith("storage/")) return raw;
  return raw.replace(/^public\//, "");
};

export const storageUrl = (path, fallbackPublicPath = "") => {
  if (!path) return fallbackPublicPath ? publicUrl(fallbackPublicPath) : "";
  if (isAbsoluteUrl(path)) return path;

  const normalized = normalizeStoragePath(path);
  if (!STORAGE_BASE_URL) {
    if (normalized.startsWith("/storage/")) return normalized;
    if (normalized.startsWith("storage/")) return `/${normalized}`;
    return `/storage/${normalized.replace(/^\/+/, "")}`;
  }

  if (normalized.startsWith("/storage/")) {
    return `${STORAGE_BASE_URL}${normalized}`;
  }
  if (normalized.startsWith("storage/")) {
    return `${STORAGE_BASE_URL}/${normalized}`;
  }
  return `${STORAGE_BASE_URL}/storage/${normalized.replace(/^\/+/, "")}`;
};

export { API_BASE_URL };
