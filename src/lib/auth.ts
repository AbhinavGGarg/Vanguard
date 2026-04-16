export const SESSION_COOKIE = 'vanguard_session';

export function createSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=active; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

export function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
