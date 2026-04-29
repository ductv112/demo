// Mock axios instance cho PKKQ DMS prototype.
// Thay vì gọi backend thật, interceptor URL trả về mock data từ mock-data.ts.
// Giữ nguyên interface như axios để các *-api.ts không cần sửa.

import { routeMock } from './mock-data';

interface MockConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any> | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: Record<string, any>;
  responseType?: string;
  timeout?: number;
  onUploadProgress?: (e: { loaded: number; total?: number }) => void;
}

async function simulate<T>(url: string, method: string, body?: unknown, config?: MockConfig): Promise<{ data: T; status: number; headers: Record<string, string> }> {
  // Small network-like delay để UI hiển thị trạng thái loading
  await new Promise((r) => setTimeout(r, 120));

  // Fake upload progress nếu caller cần — nhảy 50% rồi 100%
  if (config?.onUploadProgress) {
    try {
      config.onUploadProgress({ loaded: 50, total: 100 });
      config.onUploadProgress({ loaded: 100, total: 100 });
    } catch {
      // ignore
    }
  }

  const result = routeMock(method, url, body, config?.params);
  return { data: result as T, status: 200, headers: {} };
}

export const api = {
  get: <T = any>(url: string, config?: MockConfig) => simulate<T>(url, 'GET', undefined, config),
  post: <T = any>(url: string, body?: unknown, config?: MockConfig) => simulate<T>(url, 'POST', body, config),
  put: <T = any>(url: string, body?: unknown, config?: MockConfig) => simulate<T>(url, 'PUT', body, config),
  patch: <T = any>(url: string, body?: unknown, config?: MockConfig) => simulate<T>(url, 'PATCH', body, config),
  delete: <T = any>(url: string, config?: MockConfig) => simulate<T>(url, 'DELETE', undefined, config),
  // Fields that axios instance normally exposes — stub so code that reads them không crash
  defaults: { baseURL: '', headers: {} },
  interceptors: {
    request: { use: () => 0, eject: () => {} },
    response: { use: () => 0, eject: () => {} },
  },
} as unknown as {
  get: <T = any>(url: string, config?: MockConfig) => Promise<{ data: T; status: number; headers: Record<string, string> }>;
  post: <T = any>(url: string, body?: unknown, config?: MockConfig) => Promise<{ data: T; status: number; headers: Record<string, string> }>;
  put: <T = any>(url: string, body?: unknown, config?: MockConfig) => Promise<{ data: T; status: number; headers: Record<string, string> }>;
  patch: <T = any>(url: string, body?: unknown, config?: MockConfig) => Promise<{ data: T; status: number; headers: Record<string, string> }>;
  delete: <T = any>(url: string, config?: MockConfig) => Promise<{ data: T; status: number; headers: Record<string, string> }>;
  defaults: { baseURL: string; headers: Record<string, unknown> };
  interceptors: {
    request: { use: (...a: unknown[]) => number; eject: (...a: unknown[]) => void };
    response: { use: (...a: unknown[]) => number; eject: (...a: unknown[]) => void };
  };
};
