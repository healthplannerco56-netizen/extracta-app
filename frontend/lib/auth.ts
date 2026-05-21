// Auth helpers — swap with your provider (NextAuth, Supabase Auth, etc.)

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("extracta_token");
}

export function setToken(token: string): void {
  localStorage.setItem("extracta_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("extracta_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
