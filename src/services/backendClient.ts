import { DEFAULT_BACKEND_BASE_URL } from '../config';

let backendBaseUrl = DEFAULT_BACKEND_BASE_URL;

export function setBackendBaseUrl(url?: string): string {
  if (!url) {
    backendBaseUrl = DEFAULT_BACKEND_BASE_URL;
    return backendBaseUrl;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    backendBaseUrl = DEFAULT_BACKEND_BASE_URL;
    return backendBaseUrl;
  }

  let normalized = trimmed.replace(/\/+$/, '');

  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `http://${normalized}`;
  }

  backendBaseUrl = normalized;
  return backendBaseUrl;
}

export function getBackendBaseUrl(): string {
  return backendBaseUrl;
}

interface BackendError {
  error?: string;
  message?: string;
}

export async function postToBackend<T>(path: string, body: unknown): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const endpoint = `${backendBaseUrl}${normalizedPath}`;

  console.log(`🔌 Calling backend: ${endpoint}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.log(`❌ Backend error (${response.status}):`, errorText);

    let parsed: BackendError | undefined;
    try {
      parsed = errorText ? (JSON.parse(errorText) as BackendError) : undefined;
    } catch {
      // Ignore JSON parse errors
    }

    const message =
      parsed?.error ||
      parsed?.message ||
      `Backend request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return (await response.json()) as T;
}
