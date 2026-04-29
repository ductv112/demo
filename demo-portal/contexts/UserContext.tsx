"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  isAuthenticated,
  getCurrentToken,
  type PortalToken,
  PORTAL_TOKEN_KEY,
} from "@/lib/auth";

interface UserContextValue {
  /** Token + user info hiện tại, null nếu chưa đăng nhập */
  user: PortalToken | null;
  /** true nếu đã đăng nhập và token còn hiệu lực */
  isLoggedIn: boolean;
  /** true trong khi đang đọc URL params / kiểm tra localStorage */
  loading: boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isLoggedIn: false,
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ── Bước 1: Đọc URL params từ SSO redirect (ưu tiên cao nhất) ──────────
    // URL có dạng: /?sso_token=xxx&sso_user_id=U01&sso_username=xxx&sso_expires=...
    const params = new URLSearchParams(window.location.search);
    const ssoToken    = params.get("sso_token");
    const ssoUserId   = params.get("sso_user_id");
    const ssoUsername = params.get("sso_username");
    const ssoExpires  = params.get("sso_expires");

    if (ssoToken && ssoUserId) {
      const tokenData: PortalToken = {
        token:     ssoToken,
        userId:    ssoUserId,
        username:  ssoUsername ?? "",
        expiresAt: ssoExpires  ?? "",
      };
      // Lưu vào localStorage domain Portal
      localStorage.setItem(PORTAL_TOKEN_KEY, JSON.stringify(tokenData));
      // Xóa params khỏi URL để token không lộ trong browser history
      window.history.replaceState({}, "", window.location.pathname);
    }

    // ── Bước 2: Dev bypass — localhost tự tạo mock token ────────────────────
    // Tránh redirect sang SSO staging khi chạy local development
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocalhost && !localStorage.getItem(PORTAL_TOKEN_KEY)) {
      const exp = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
      const devToken: PortalToken = {
        token:     "dev-mock-token",
        userId:    "U01",
        username:  "giamdoc",
        expiresAt: exp,
      };
      localStorage.setItem(PORTAL_TOKEN_KEY, JSON.stringify(devToken));
    }

    // ── Bước 3: Kiểm tra auth state từ localStorage ─────────────────────────
    if (isAuthenticated()) {
      setUser(getCurrentToken());
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoggedIn: !!user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  return useContext(UserContext);
}
