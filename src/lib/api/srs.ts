/**
 * SRS (Spaced Repetition System) API Client
 * 
 * API functions for the FSRS-powered spaced repetition system.
 */

import { api } from "@/lib/api";

// =============================================================================
// Types
// =============================================================================

export interface DueWord {
    id: number;
    word: string;
    definition: string;
    partOfSpeech: string;
    pronunciation: string;
    examples: string[];
    state: "New" | "Learning" | "Review" | "Relearning";
    due: string | null;
}

export interface DueWordsResponse {
    words: DueWord[];
    total: number;
}

export interface ReviewRequest {
    word_id: number;
    rating: 1 | 2 | 3 | 4;  // 1=Again, 2=Hard, 3=Good, 4=Easy
}

export interface ReviewResponse {
    id: number;
    word: string;
    state: string;
    due: string | null;
    masteryLevel: number;
    reviewCount: number;
}

export interface SRSStats {
    totalCards: number;
    dueToday: number;
    newCards: number;
    learningCards: number;
    reviewCards: number;
    relearningCards: number;
    averageRetention: number;
}

export interface ForecastDay {
    date: string;
    count: number;
}

export interface ForecastResponse {
    forecast: ForecastDay[];
}

// Rating labels and colors for UI
export const RATING_CONFIG = {
    1: { label: "Again", color: "bg-red-500", description: "Didn't remember" },
    2: { label: "Hard", color: "bg-orange-500", description: "Serious difficulty" },
    3: { label: "Good", color: "bg-green-500", description: "After hesitation" },
    4: { label: "Easy", color: "bg-blue-500", description: "Remembered instantly" },
} as const;

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get words due for review.
 */
export async function getDueWords(limit = 20): Promise<DueWordsResponse> {
    return api.get<DueWordsResponse>(`/api/srs/due?limit=${limit}`);
}

/**
 * Record a review result.
 */
export async function recordReview(wordId: number, rating: 1 | 2 | 3 | 4): Promise<ReviewResponse> {
    return api.post<ReviewResponse>("/api/srs/review", {
        word_id: wordId,
        rating,
    });
}

/**
 * Get SRS statistics.
 */
export async function getSRSStats(): Promise<SRSStats> {
    return api.get<SRSStats>("/api/srs/stats");
}

/**
 * Get review forecast for the next N days.
 */
export async function getReviewForecast(days = 7): Promise<ForecastResponse> {
    return api.get<ForecastResponse>(`/api/srs/forecast?days=${days}`);
}
