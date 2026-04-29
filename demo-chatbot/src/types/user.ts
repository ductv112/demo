export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role?: string;
  department?: string;
}
