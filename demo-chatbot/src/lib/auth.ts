/**
 * Auth stub — PKKQ prototype không cần Keycloak thực tế.
 * Tất cả hàm trả về giá trị giả lập để UI hoạt động.
 */

const FAKE_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWRpcmVjdG9yIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicHFodW5nIiwiZW1haWwiOiJwcWh1bmdAejExOS5taWwudm4iLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiR2nDoW0gxJHhu5FjIE5ow6AgbcOheSJdfSwiZXhwIjo5OTk5OTk5OTk5fQ.stub-signature';
const FAKE_REFRESH_TOKEN = 'stub-refresh-token';

export function generateCodeVerifier(): string {
  return 'stub-verifier';
}

export async function generateCodeChallenge(_verifier: string): Promise<string> {
  return 'stub-challenge';
}

export function getRememberMe(): boolean {
  return false;
}

export function setRememberMe(_value: boolean): void {
  /* no-op */
}

export async function buildAuthUrl(_redirectPath?: string, _rememberMe?: boolean): Promise<string> {
  return '/login';
}

export async function exchangeCodeForTokens(
  _code: string,
  _codeVerifier: string,
): Promise<{
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
}> {
  return {
    access_token: FAKE_ACCESS_TOKEN,
    refresh_token: FAKE_REFRESH_TOKEN,
    id_token: FAKE_ACCESS_TOKEN,
    expires_in: 9_999_999,
  };
}

export async function refreshAccessToken(_refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
}> {
  return {
    access_token: FAKE_ACCESS_TOKEN,
    refresh_token: FAKE_REFRESH_TOKEN,
    id_token: FAKE_ACCESS_TOKEN,
    expires_in: 9_999_999,
  };
}

export async function logoutFromKeycloak(): Promise<void> {
  /* no-op */
}

export function buildLogoutUrl(_postLogoutRedirectUri?: string): string {
  return '/login';
}

export function redirectToKeycloakLogout(_postLogoutRedirectUri?: string): void {
  if (typeof window === 'undefined') return;
  clearTokens();
  window.location.href = '/login';
}

export function storeTokens(_accessToken: string, _refreshToken: string, _idToken?: string): void {
  /* no-op */
}

export function getStoredTokens(): { accessToken: string; refreshToken: string } | null {
  return { accessToken: FAKE_ACCESS_TOKEN, refreshToken: FAKE_REFRESH_TOKEN };
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('dms_access_token');
    localStorage.removeItem('dms_refresh_token');
    localStorage.removeItem('dms_id_token');
  } catch {
    /* ignore */
  }
}

export function isTokenExpired(_token: string): boolean {
  return false;
}

export function parseJwt(_token: string): any {
  return {
    sub: 'user-director',
    preferred_username: 'pqhung',
    email: 'pqhung@z119.mil.vn',
    realm_access: { roles: ['Giám đốc Nhà máy'] },
    exp: 9_999_999_999,
  };
}
