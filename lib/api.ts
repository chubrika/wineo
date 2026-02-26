/**
 * Backend API base URL. Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:4000).
 */
export const API_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
  "http://localhost:4000";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
};

export type RegisterBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};
export type LoginBody = { email: string; password: string };

export type AuthResponse = { user: AuthUser; token: string };
export type MeResponse = { user: AuthUser };

async function handleRes<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string })?.error ?? res.statusText;
    throw new Error(message);
  }
  return data as T;
}

export async function register(body: RegisterBody): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleRes<AuthResponse>(res);
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleRes<AuthResponse>(res);
}

export async function getMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleRes<MeResponse>(res);
}
