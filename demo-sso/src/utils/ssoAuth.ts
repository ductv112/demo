import { users } from '../data/users';
import type { SSOUser } from '../types';

// ============================================================
// Constants
// ============================================================

const TOKEN_KEY = 'sso_token';
const USER_KEY = 'sso_user';
const CLIENTS_KEY = 'sso_clients'; // danh sách app đang dùng SSO session

/**
 * Whitelist các URI được phép redirect sau logout / callback.
 * Validate trước khi redirect để tránh open redirect attack.
 */
export const ALLOWED_REDIRECT_URIS: string[] = [
  // Staging domains
  'http://localhost:3000',
  'http://localhost:5175',
  'http://localhost:5177',
  'http://localhost:5176',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180',
  'http://localhost:5181',
  'http://localhost:5182',
  'http://localhost:5183',
  'http://localhost:5184',
  'http://localhost:5185',
  'http://localhost:5186',
  'http://localhost:5187',
  'http://localhost:5188',
  // SSO chính
  'http://localhost:5173',
  // Local dev — các port thường dùng
  'http://localhost:3000',
  'http://localhost:3011',
  'http://localhost:4000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:8080',
];

/**
 * Danh sách client_id hợp lệ và URL gốc tương ứng.
 * Dùng để validate client khi nhận request logout/callback.
 */
export const REGISTERED_CLIENTS: Record<string, string> = {
  'pkkq-portal': 'http://localhost:3000',
  'pkkq-taichinhketoan': 'http://localhost:5175',
  'pkkq-muahang': 'http://localhost:5177',
  'pkkq-hopdongnhiemvu': 'http://localhost:5176',
  'pkkq-kho': 'http://localhost:5178',
  'pkkq-sanxuat': 'http://localhost:5179',
  'pkkq-baotri': 'http://localhost:5180',
  'pkkq-suachua': 'http://localhost:5181',
  'pkkq-daitu': 'http://localhost:5182',
  'pkkq-vongdoi': 'http://localhost:5183',
  'pkkq-chatluong': 'http://localhost:5184',
  'pkkq-suco': 'http://localhost:5185',
  'pkkq-thunghiem': 'http://localhost:5186',
  'pkkq-doluong': 'http://localhost:5187',
  'pkkq-antoan': 'http://localhost:5188',
};

// ============================================================
// Types
// ============================================================

export interface AuthToken {
  token: string;
  userId: string;
  username: string;
  issuedAt: string;
  expiresAt: string;
}

export interface LogoutParams {
  clientId?: string;
  postLogoutRedirectUri?: string;
}

// ============================================================
// Token helpers
// ============================================================

function generateToken(user: SSOUser): AuthToken {
  const now = new Date();
  const expires = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 giờ
  return {
    token: `mock-jwt-${user.id}-${now.getTime()}`,
    userId: user.id,
    username: user.username,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
}

// ============================================================
// Validate redirect URI
// ============================================================

/**
 * Kiểm tra URI có nằm trong whitelist không.
 * So sánh theo origin (scheme + host + port), bỏ qua path.
 */
export function validateRedirectUri(uri: string): boolean {
  if (!uri) return false;
  try {
    const parsed = new URL(uri);
    const origin = parsed.origin; // e.g. "http://localhost:3000"
    return ALLOWED_REDIRECT_URIS.some(allowed => {
      const allowedOrigin = new URL(allowed).origin;
      return origin === allowedOrigin;
    });
  } catch {
    return false;
  }
}

// ============================================================
// Session / Client tracking (Single Sign-On state)
// ============================================================

/** Ghi nhận client đang dùng SSO session (để single sign-out) */
export function registerClient(clientId: string): void {
  if (!clientId) return;
  const clients: string[] = getActiveClients();
  if (!clients.includes(clientId)) {
    clients.push(clientId);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  }
}

/** Lấy danh sách client đang dùng SSO session */
export function getActiveClients(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

// ============================================================
// Core auth functions
// ============================================================

export function login(
  username: string,
  password: string,
  clientId?: string,
): { success: boolean; user?: SSOUser; token?: AuthToken; error?: string } {
  const user = users.find(u => u.username === username);
  if (!user) return { success: false, error: 'Tài khoản không tồn tại' };
  if (user.status === 'locked') return { success: false, error: 'Tài khoản đã bị khóa. Liên hệ quản trị viên' };
  if (user.status === 'inactive') return { success: false, error: 'Tài khoản đã bị vô hiệu hóa' };
  if (user.password !== password) return { success: false, error: 'Sai mật khẩu' };

  const token = generateToken(user);
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  // Ghi nhận client đã đăng nhập vào SSO session
  if (clientId) registerClient(clientId);

  // Phát sự kiện để các tab/app khác trong cùng origin nhận biết
  window.dispatchEvent(new StorageEvent('storage', {
    key: TOKEN_KEY,
    newValue: JSON.stringify(token),
    storageArea: localStorage,
  }));

  return { success: true, user, token };
}

/**
 * Global logout — xóa toàn bộ SSO session.
 * Dispatch storage event để các tab/app khác cùng origin nhận biết.
 */
export function globalLogout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(CLIENTS_KEY);

  // Phát sự kiện logout để các tab/cửa sổ khác trong cùng origin tự logout
  window.dispatchEvent(new StorageEvent('storage', {
    key: TOKEN_KEY,
    oldValue: 'logged_in',
    newValue: null,
    storageArea: localStorage,
  }));

  // Cũng set một flag để các app khác biết session đã bị clear
  localStorage.setItem('sso_logout_event', Date.now().toString());
  // Xóa flag ngay sau (chỉ dùng để trigger storage event ở tab khác)
  setTimeout(() => localStorage.removeItem('sso_logout_event'), 200);
}

export function logout(): void {
  globalLogout();
}

export function checkAuth(): boolean {
  const tokenStr = localStorage.getItem(TOKEN_KEY);
  if (!tokenStr) return false;
  try {
    const token: AuthToken = JSON.parse(tokenStr);
    return new Date(token.expiresAt) > new Date();
  } catch {
    return false;
  }
}

export function getCurrentUser(): SSOUser | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getToken(): AuthToken | null {
  const tokenStr = localStorage.getItem(TOKEN_KEY);
  if (!tokenStr) return null;
  try {
    return JSON.parse(tokenStr);
  } catch {
    return null;
  }
}

export function redirectToSSO(returnUrl?: string): void {
  const url = returnUrl
    ? `/sso/login?redirect=${encodeURIComponent(returnUrl)}`
    : '/sso/login';
  window.location.href = url;
}
