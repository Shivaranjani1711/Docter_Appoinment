// In dev, Vite's proxy (vite.config.ts) forwards a relative "/api/v1" path to
// the local backend, so VITE_API_BASE_URL is left unset. In production the
// frontend (Vercel) and backend (Render) are on different domains with no
// proxy in between, so the build must be given the backend's real URL via
// this env var (set in Vercel's project settings, not committed to the repo).
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ""}/api/v1`;

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, { method: "POST", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json();
        setAccessToken(data.accessToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  isFormData?: boolean;
  skipAuthRetry?: boolean;
}

// Protected files (medical reports) require the Authorization header, so a plain
// <a href> won't work - the browser wouldn't send our in-memory access token.
// Fetch as a blob instead and hand the caller an object URL to open/download.
export async function apiFetchBlob(path: string): Promise<{ blob: Blob; filename: string | null }> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response = await fetch(`${API_BASE_URL}${path}`, { headers, credentials: "include" });

  if (response.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      response = await fetch(`${API_BASE_URL}${path}`, { headers, credentials: "include" });
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, "DOWNLOAD_FAILED", "Could not download this file.");
  }

  const disposition = response.headers.get("content-disposition");
  const match = disposition?.match(/filename="(.+)"/);
  return { blob: await response.blob(), filename: match?.[1] ?? null };
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (!options.isFormData && options.body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
    body: options.isFormData
      ? (options.body as FormData)
      : options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  });

  if (response.status === 401 && !options.skipAuthRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, skipAuthRetry: true });
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : undefined;

  if (!response.ok) {
    const err = payload?.error ?? { code: "UNKNOWN_ERROR", message: "Something went wrong" };
    throw new ApiError(response.status, err.code, err.message, err.details);
  }

  return payload as T;
}
