/**
 * User API functions
 */

import { api } from '../api';

// Types matching backend schemas
export interface UserProfile {
  id: number;
  email: string;
  displayName: string | null;
  learningLevel: 'beginner' | 'intermediate' | 'advanced';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  reminderEnabled: boolean;
  reminderTime: string | null;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface UserUpdateRequest {
  display_name?: string;
  learning_level?: 'beginner' | 'intermediate' | 'advanced';
  sound_enabled?: boolean;
  notifications_enabled?: boolean;
  reminder_enabled?: boolean;
  reminder_time?: string;
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<UserProfile> {
  const response = await api.get<UserProfile>('/api/users/me');
  return response;
}

/**
 * Update current user profile
 */
export async function updateUser(data: UserUpdateRequest): Promise<UserProfile> {
  const response = await api.put<UserProfile>('/api/users/me', data);
  return response;
}

export default {
  getCurrentUser,
  updateUser,
};

