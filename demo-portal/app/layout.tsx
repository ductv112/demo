import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

const inter = localFont({
  src: [
    { path: "../public/fonts/inter-300.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/inter-400.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/inter-500.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/inter-600.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/inter-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cổng thông tin nội bộ — Doanh nghiệp A",
  description: "Hệ thống cổng thông tin nội bộ Doanh nghiệp A - Nền tảng quản trị toàn diện cho doanh nghiệp công nghệ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} antialiased font-sans`}>
        <UserProvider>
          <AuthGuard>{children}</AuthGuard>
        </UserProvider>
      </body>
    </html>
  );
}
