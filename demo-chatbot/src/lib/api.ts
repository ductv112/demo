/**
 * Axios stub — PKKQ prototype không cần backend thật.
 * Giữ interface axios tương thích; các API file khác đã override
 * bằng mock data, nên api instance này chỉ cần không crash.
 */

import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/mock',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Swallow errors trong prototype — mọi API call thật sự đã bị mock
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
