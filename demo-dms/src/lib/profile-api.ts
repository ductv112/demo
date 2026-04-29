import { api } from './api';
import { UserProfile } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getMyProfile(): Promise<UserProfile> {
  const { data } = await api.get('/users/me');
  // Avatar URL từ backend là relative path — prepend API base URL
  if (data.avatarUrl && data.avatarUrl.startsWith('/')) {
    data.avatarUrl = `${API_URL}${data.avatarUrl}`;
  }
  return data;
}

export async function updateMyProfile(payload: { fullName: string; phone?: string }): Promise<UserProfile> {
  const { data } = await api.put('/users/me', payload);
  return data;
}

export async function uploadAvatar(file: Blob): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('file', file, 'avatar.jpg');
  const { data } = await api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (data.avatarUrl && data.avatarUrl.startsWith('/')) {
    data.avatarUrl = `${API_URL}${data.avatarUrl}`;
  }
  return data;
}
