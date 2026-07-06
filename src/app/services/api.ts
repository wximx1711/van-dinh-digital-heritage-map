export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

let csrfToken: string | null = null;
let csrfHeaderName = 'X-CSRF-TOKEN';

function clearCsrfToken() {
  csrfToken = null;
}

export async function getCsrfToken(): Promise<{ token: string; headerName: string }> {
  if (csrfToken) return { token: csrfToken, headerName: csrfHeaderName };
  const res = await fetch('/api/security/csrf-token', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to get CSRF token');
  const data = await res.json() as { token: string; headerName: string };
  csrfToken = data.token;
  csrfHeaderName = data.headerName;
  return data;
}

function getErrorMsg(res: Response, body: any): string {
  if (body?.errors && Array.isArray(body.errors) && body.errors.length > 0) {
    return body.errors.join('; ');
  }
  return body?.message || `Request failed: ${res.status} ${res.statusText}`;
}

async function fetchWithCsrf<T>(path: string, method: string, body?: unknown, isFormData = false): Promise<T> {
  const { token, headerName } = await getCsrfToken();
  const headers: Record<string, string> = { [headerName]: token };
  if (!isFormData && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body !== undefined ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(getErrorMsg(res, errorData));
  }
  const json = await res.json() as ApiResponse<T>;
  if (!json.success) throw new Error(json.message || `${method} ${path} failed`);
  return json.data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, { credentials: 'include' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(getErrorMsg(res, body));
  }
  const json = await res.json() as ApiResponse<T>;
  if (!json.success) throw new Error(json.message || `GET ${path} failed`);
  return json.data as T;
}

export async function apiPost<T>(path: string, body: unknown, isFormData = false): Promise<T> {
  try {
    return await fetchWithCsrf<T>(path, 'POST', body, isFormData);
  } catch (err) {
    clearCsrfToken();
    throw err;
  }
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  try {
    return await fetchWithCsrf<T>(path, 'PUT', body, false);
  } catch (err) {
    clearCsrfToken();
    throw err;
  }
}

export async function apiDelete<T>(path: string): Promise<T> {
  try {
    return await fetchWithCsrf<T>(path, 'DELETE');
  } catch (err) {
    clearCsrfToken();
    throw err;
  }
}
