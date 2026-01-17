/**
 * Game Questions API Client
 * Handles fetching game questions from the backend
 */

import { api } from '../api';

// =============================================================================
// Types
// =============================================================================

export interface RocketQuestion {
    id: number;
    word: string;
    meaning: string;
    correctSynonym: string;
    options: string[];
    difficulty?: string;
    is_reviewed?: boolean;
}

export interface RocketQuestionsResponse {
    game_type: string;
    count: number;
    questions: RocketQuestion[];
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Fetch rocket game questions from the backend.
 * Falls back to unreviewed questions if no reviewed ones exist.
 */
export async function fetchRocketQuestions(limit = 10): Promise<RocketQuestion[]> {
    try {
        // Try to get reviewed questions first (production-ready)
        const response = await api.get<RocketQuestionsResponse>(
            `/api/game-questions/rocket?limit=${limit}&only_reviewed=true&random_order=true`,
            false // No auth required for game questions
        );

        if (response.questions.length > 0) {
            return response.questions;
        }

        // Fallback: get any questions if no reviewed ones exist
        const fallbackResponse = await api.get<RocketQuestionsResponse>(
            `/api/game-questions/rocket?limit=${limit}&only_reviewed=false&random_order=true`,
            false
        );

        return fallbackResponse.questions;
    } catch (error) {
        console.error('Failed to fetch rocket questions:', error);
        throw error;
    }
}

/**
 * Check if backend has rocket questions available.
 */
export async function hasRocketQuestions(): Promise<boolean> {
    try {
        const response = await api.get<RocketQuestionsResponse>(
            '/api/game-questions/rocket?limit=1',
            false
        );
        return response.count > 0;
    } catch {
        return false;
    }
}
