"use client";

import { useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { redirectToSSO } from "@/lib/auth";

/**
 * AuthGuard — bảo vệ toàn bộ Portal.
 *
 * Luồng:
 *   loading = true  → không render gì (UserContext đang đọc URL params / localStorage)
 *   loading = false, isLoggedIn = true  → render children bình thường
 *   loading = false, isLoggedIn = false → redirect sang SSO session check:
 *     - SSO còn session → SSO redirect về Portal kèm token → UserContext lưu token → render
 *     - SSO hết session → SSO hiện trang đăng nhập
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useUser();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      redirectToSSO();
    }
  }, [isLoggedIn, loading]);

  // Chưa check xong hoặc đang redirect → không render để tránh flash nội dung
  if (loading || !isLoggedIn) return null;

  return <>{children}</>;
}
