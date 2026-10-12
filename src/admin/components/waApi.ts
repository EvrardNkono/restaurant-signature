export const API = import.meta.env.VITE_WA_API || "http://localhost:4000/api/whatsapp";
const TOKEN_KEY = "wa_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function waFetch(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${getToken() ?? ""}` },
  });
  if (res.status === 401) {
    clearToken();
    window.location.reload();
  }
  return res;
}