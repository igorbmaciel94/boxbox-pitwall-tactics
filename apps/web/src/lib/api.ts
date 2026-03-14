const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface AuthResponse {
  token: string;
  username: string;
  playerCode: string;
}

export interface SyncPayload {
  selectedTeam: string | null;
  locale: string;
  savedDecks: unknown[];
  bestScores: unknown[];
  runHistory: unknown[];
  seasonRuns: unknown[];
  trophies: unknown[];
  lastSyncedAt: number;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchSyncData(token: string): Promise<SyncPayload> {
  return request<SyncPayload>('/me/sync', {
    headers: authHeaders(token),
  });
}

export async function uploadSyncData(token: string, data: SyncPayload): Promise<void> {
  await request('/me/sync', {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export { ApiError };
