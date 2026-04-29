/**
 * Profile API — mock cho PKKQ prototype.
 * Luôn trả về user demo (Giám đốc Nhà máy Z119).
 */

import type { UserProfile } from '@/types/user';
import { DEMO_USER } from '@/lib/mock-data';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getMyProfile(): Promise<UserProfile> {
  await delay(80);
  return { ...DEMO_USER };
}

export async function updateMyProfile(payload: {
  fullName: string;
  phone?: string;
}): Promise<UserProfile> {
  await delay(120);
  return { ...DEMO_USER, fullName: payload.fullName, phone: payload.phone ?? DEMO_USER.phone };
}

export async function uploadAvatar(_file: Blob): Promise<{ avatarUrl: string }> {
  await delay(200);
  return { avatarUrl: '' };
}
