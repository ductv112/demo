import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Development configuration
  reactStrictMode: true,

  // Production standalone output — tối ưu cho Docker image
  // Bundle server + dependencies vào .next/standalone/
  // Kích hoạt khi build với NODE_ENV=production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // Turbopack root — tránh cảnh báo inferred workspace root
  turbopack: {
    root: __dirname,
  },

  // Tối ưu compile trong Docker — giảm thời gian "Compiling..."
  transpilePackages: [],
  // Webpack watch options cho Docker/Windows — polling thay vì inotify
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 300,
        aggregateTimeout: 200,
      };
    }
    return config;
  },

  experimental: {
    // Tối ưu module resolution — bỏ qua barrel exports không cần thiết
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-avatar',
      '@radix-ui/react-scroll-area',
      'date-fns',
    ],
  },

  // Cache-control headers
  // Production: static assets có unique build hash → cache 1 năm (immutable)
  // Development: không cache static assets → luôn load version mới khi refresh
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';

    return [
      {
        // HTML pages — không cache, luôn lấy version mới
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        // Static assets — production cache dài hạn, dev không cache
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
