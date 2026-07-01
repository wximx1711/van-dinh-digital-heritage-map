export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

let csrfToken: string | null = null;
let csrfHeaderName = 'X-CSRF-TOKEN';

export async function getCsrfToken(): Promise<{ token: string; headerName: string }> {
  if (csrfToken) return { token: csrfToken, headerName: csrfHeaderName };
  const res = await fetch('/api/security/csrf-token', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to get CSRF token');
  const data = await res.json() as { token: string; headerName: string };
  csrfToken = data.token;
  csrfHeaderName = data.headerName;
  return data;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.statusText}`);
  const json = await res.json() as ApiResponse<T>;
  if (!json.success) throw new Error(json.message || `GET ${path} failed`);
  return json.data as T;
}

export async function apiPost<T>(path: string, body: unknown, isFormData = false): Promise<T> {
  const { token, headerName } = await getCsrfToken();
  const headers: Record<string, string> = { [headerName]: token };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: isFormData ? (body as FormData) : JSON.stringify(body),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `POST ${path} failed`);
  }
  const json = await res.json() as ApiResponse<T>;
  if (!json.success) throw new Error(json.message || `POST ${path} failed`);
  return json.data as T;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const { token, headerName } = await getCsrfToken();
  const res = await fetch(`/api${path}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [headerName]: token,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `PUT ${path} failed`);
  }
  const json = await res.json() as ApiResponse<T>;
  if (!json.success) throw new Error(json.message || `PUT ${path} failed`);
  return json.data as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const { token, headerName } = await getCsrfToken();
  const res = await fetch(`/api${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { [headerName]: token },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `DELETE ${path} failed`);
  }
  const json = await res.json() as ApiResponse<T>;
  if (!json.success) throw new Error(json.message || `DELETE ${path} failed`);
  return json.data as T;
}
