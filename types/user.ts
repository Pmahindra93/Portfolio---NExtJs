export type UserRole = 'admin' | 'editor' | 'user';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role?: UserRole;
}
