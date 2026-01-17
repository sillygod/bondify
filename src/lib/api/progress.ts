/**
 * Progress API functions
 */

import { api } from '../api';

// Types matching backend schemas
export interface StreakDay {
  date: string;
  hasActivity: boolean;
  intensity: number;
  xp: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  history: StreakDay[];
}

export interface LearningStats {
  wordsLearned: number;
  accuracyRate: number;
  currentStreak: number;
  totalXp: number;
  lessonsDone: number;
  timeSpentHours: number;
  bestStreak: number;
  todayWordsLearned: number;
  todayXp: number;
}

export interface ActivityRequest {
  xp?: number;
  wordsLearned?: number;
  timeSpentMinutes?: number;
}

export interface ActivityResponse {
  success: boolean;
  xpEarned: number;
  currentStreak: number;
  newAchievements: string[];
}

export interface Achievement {
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AchievementsListResponse {
  achievements: Achievement[];
}

/**
 * Get learning statistics
 */
export async function getStats(): Promise<LearningStats> {
  const response = await api.get<LearningStats>('/api/progress/stats');
  return response;
}

/**
 * Get streak data
 */
export async function getStreak(): Promise<StreakData> {
  const response = await api.get<StreakData>('/api/progress/streak');
  return response;
}

/**
 * Record a learning activity
 */
export async function recordActivity(data: ActivityRequest): Promise<ActivityResponse> {
  const response = await api.post<ActivityResponse>('/api/progress/activity', data);
  return response;
}

/**
 * Get achievements list
 */
export async function getAchievements(): Promise<Achievement[]> {
  const response = await api.get<AchievementsListResponse>('/api/progress/achievements');
  return response.achievements;
}

export default {
  getStats,
  getStreak,
  recordActivity,
  getAchievements,
};
