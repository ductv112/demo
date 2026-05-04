// Auth stub cho Doanh nghiệp A DMS prototype — không dùng Keycloak.
// Giữ nguyên tên các export để code khác không cần sửa.

const FAKE_ACCESS_TOKEN = 'mock.access.token';
const FAKE_REFRESH_TOKEN = 'mock.refresh.token';
const FAKE_ID_TOKEN = 'mock.id.token';

export function generateCodeVerifier(): string {
  return 'mock-verifier';
}

export async function generateCodeChallenge(_verifier: string): Promise<string> {
  return 'mock-challenge';
}

export function getRememberMe(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('pkkq_remember_me') === 'true';
}

export function setRememberMe(value: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pkkq_remember_me', String(value));
}

export async function buildAuthUrl(_redirectPath?: string, _rememberMe?: boolean): Promise<string> {
  return '/';
}

export async function exchangeCodeForTokens(_code: string, _codeVerifier: string) {
  return { access_token: FAKE_ACCESS_TOKEN, refresh_token: FAKE_REFRESH_TOKEN, id_token: FAKE_ID_TOKEN, expires_in: 3600 };
}

export async function refreshAccessToken(_refreshToken: string) {
  return { access_token: FAKE_ACCESS_TOKEN, refresh_token: FAKE_REFRESH_TOKEN, id_token: FAKE_ID_TOKEN, expires_in: 3600 };
}

export async function logoutFromKeycloak(): Promise<void> {
  return;
}

export function buildLogoutUrl(postLogoutRedirectUri?: string): string {
  if (typeof window === 'undefined') return '/login';
  return postLogoutRedirectUri ?? `${window.location.origin}/login`;
}

export function redirectToKeycloakLogout(postLogoutRedirectUri?: string): void {
  if (typeof window === 'undefined') return;
  clearTokens();
  window.location.href = postLogoutRedirectUri ?? '/login';
}

export function storeTokens(_accessToken: string, _refreshToken: string, _idToken?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pkkq_authenticated', 'true');
}

export function getStoredTokens(): { accessToken: string; refreshToken: string } | null {
  // Luôn trả token giả để hệ thống coi như đã đăng nhập.
  return { accessToken: FAKE_ACCESS_TOKEN, refreshToken: FAKE_REFRESH_TOKEN };
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('pkkq_authenticated');
}

export function isTokenExpired(_token: string): boolean {
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseJwt(_token: string): any {
  return {
    sub: 'user-1',
    preferred_username: 'hoangmt',
    email: 'hmtuan@doanhnghiepa.vn',
    realm_access: { roles: ['department_manager'] },
    exp: Math.floor(Date.now() / 1000) + 365 * 24 * 3600,
  };
}
