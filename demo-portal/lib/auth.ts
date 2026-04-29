/**
 * Auth utility — Portal nhận token từ SSO qua URL params sau khi đăng nhập.
 * Token được lưu vào localStorage với key "portal_token".
 *
 * Luồng:
 *   SSO redirect → /?sso_token=xxx&sso_user_id=U01&...
 *   UserContext đọc params → lưu portal_token → clean URL
 *   AuthGuard kiểm tra token → nếu hết hạn → SSO session check
 *   Logout → gọi SSO logout endpoint (SSO xóa session toàn cục)
 */

export const SSO_URL =
  process.env.NEXT_PUBLIC_SSO_URL ?? "https://pkkq-sso-staging.dft.vn";

export const PORTAL_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://pkkq-portal-staging.dft.vn";

export const PORTAL_TOKEN_KEY = "portal_token";

export interface PortalToken {
  token: string;     // JWT mock string từ SSO
  userId: string;    // e.g. "U01"
  username: string;  // e.g. "giamdoc"
  expiresAt: string; // ISO datetime string
}

/** Kiểm tra token trong localStorage còn hiệu lực */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const str = localStorage.getItem(PORTAL_TOKEN_KEY);
    if (!str) return false;
    const token: PortalToken = JSON.parse(str);
    if (!token.expiresAt) return false;
    return new Date(token.expiresAt) > new Date();
  } catch {
    return false;
  }
}

/** Lấy thông tin token hiện tại */
export function getCurrentToken(): PortalToken | null {
  if (typeof window === "undefined") return null;
  try {
    const str = localStorage.getItem(PORTAL_TOKEN_KEY);
    return str ? (JSON.parse(str) as PortalToken) : null;
  } catch {
    return null;
  }
}

/**
 * Đăng xuất — KHÔNG xóa localStorage trực tiếp.
 * Gọi SSO logout endpoint để SSO xóa session toàn cục,
 * sau đó SSO redirect về Portal (lúc này không có token → chưa đăng nhập).
 */
export function logout(): void {
  if (typeof window === "undefined") return;
  // Xóa token local ngay để tránh flash nội dung khi SSO redirect về
  localStorage.removeItem(PORTAL_TOKEN_KEY);
  const postLogoutUri = encodeURIComponent(`${PORTAL_URL}/`);
  window.location.href =
    `${SSO_URL}/sso/logout` +
    `?client_id=pkkq-portal` +
    `&post_logout_redirect_uri=${postLogoutUri}`;
}

/**
 * Redirect sang SSO để kiểm tra session (auto-login).
 * SSO còn session → redirect về Portal kèm token params.
 * SSO hết session → hiện trang đăng nhập.
 */
export function redirectToSSO(): void {
  if (typeof window === "undefined") return;
  const redirectUri = encodeURIComponent(`${PORTAL_URL}/`);
  window.location.replace(
    `${SSO_URL}/sso/session` +
    `?client_id=pkkq-portal` +
    `&redirect_uri=${redirectUri}`
  );
}
