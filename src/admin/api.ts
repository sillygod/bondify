/**
 * Admin API Client
 * Centralized functions for admin operations
 */

export interface Question {
    id: number;
    game_type: string;
    difficulty: string;
    is_reviewed: boolean;
    question_json?: string; // Sometimes returned as string in DB objects
    [key: string]: any;
}

// Helper for requests - using shared API client for auth
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// Re-export api from lib/api but we don't strictly need it if we import directly
import { api } from '@/lib/api';

/**
 * Fetch questions by game type (Public/User endpoint)
 */
export async function getQuestions(gameType: string, limit = 50): Promise<{ questions: Question[] }> {
    // This endpoint remains public/user accessible for now as it doesn't modify data
    // But managing them might require admin rights later. For now it points to standard game-questions endpoint
    return api.get<{ questions: Question[] }>(`/api/game-questions/${gameType}?limit=${limit}`, false);
}

/**
 * Update review status (Admin)
 */
export async function updateReviewStatus(id: number, reviewed: boolean): Promise<any> {
    return api.patch(`/api/admin/questions/${id}/review?reviewed=${reviewed}`);
}

/**
 * Delete a question (Admin)
 */
export async function deleteQuestion(id: number): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`/api/admin/questions/${id}`);
}

/**
 * Update a question's content (Admin)
 */
export async function updateQuestion(id: number, updates: Partial<Question>): Promise<Question> {
    return api.patch<Question>(`/api/admin/questions/${id}`, updates);
}
