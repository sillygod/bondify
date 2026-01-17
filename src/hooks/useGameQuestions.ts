/**
 * Game Questions Hooks
 * 
 * TanStack Query hooks for fetching game questions with caching.
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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

export interface DictionQuestion {
    id: number;
    sentence: string;
    highlightedPart: {
        startIndex: number;
        text: string;
    };
    isCorrect: boolean;
    correctVersion?: string;
    category: "vocabulary" | "grammar" | "idiom" | "preposition" | "word-choice";
    explanation: string;
}

interface QuestionsResponse<T> {
    game_type: string;
    count: number;
    questions: T[];
}

// =============================================================================
// Fetch Functions
// =============================================================================

async function fetchRocketQuestions(limit: number): Promise<RocketQuestion[]> {
    // Try reviewed first
    const response = await api.get<QuestionsResponse<RocketQuestion>>(
        `/api/game-questions/rocket?limit=${limit}&only_reviewed=true&random_order=true`,
        false
    );

    if (response.questions.length > 0) {
        return response.questions;
    }

    // Fallback to unreviewed
    const fallback = await api.get<QuestionsResponse<RocketQuestion>>(
        `/api/game-questions/rocket?limit=${limit}&only_reviewed=false&random_order=true`,
        false
    );

    return fallback.questions;
}

async function fetchDictionQuestions(limit: number): Promise<DictionQuestion[]> {
    const response = await api.get<QuestionsResponse<DictionQuestion>>(
        `/api/game-questions/diction?limit=${limit}&only_reviewed=true&random_order=true`,
        false
    );

    if (response.questions.length > 0) {
        return response.questions;
    }

    const fallback = await api.get<QuestionsResponse<DictionQuestion>>(
        `/api/game-questions/diction?limit=${limit}&only_reviewed=false&random_order=true`,
        false
    );

    return fallback.questions;
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Hook for fetching Rocket game questions.
 * Questions are cached and can be refetched on demand.
 */
export function useRocketQuestions(limit = 10) {
    return useQuery({
        queryKey: ['game-questions', 'rocket', limit],
        queryFn: () => fetchRocketQuestions(limit),
        enabled: false, // Manual trigger with refetch()
        staleTime: 0, // Always get fresh questions for new games
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}

/**
 * Hook for fetching Diction game questions.
 * Questions are cached and can be refetched on demand.
 */
export function useDictionQuestions(limit = 10) {
    return useQuery({
        queryKey: ['game-questions', 'diction', limit],
        queryFn: () => fetchDictionQuestions(limit),
        enabled: false, // Manual trigger with refetch()
        staleTime: 0, // Always get fresh questions for new games
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}

// =============================================================================
// Recall Game
// =============================================================================

export interface RecallQuestion {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    difficulty?: string;
    is_reviewed?: boolean;
}

async function fetchRecallQuestions(limit: number): Promise<RecallQuestion[]> {
    const response = await api.get<QuestionsResponse<RecallQuestion>>(
        `/api/game-questions/recall?limit=${limit}&only_reviewed=true&random_order=true`,
        false
    );

    if (response.questions.length > 0) {
        return response.questions;
    }

    const fallback = await api.get<QuestionsResponse<RecallQuestion>>(
        `/api/game-questions/recall?limit=${limit}&only_reviewed=false&random_order=true`,
        false
    );

    return fallback.questions;
}

/**
 * Hook for fetching Recall game questions.
 * Questions are cached and can be refetched on demand.
 */
export function useRecallQuestions(limit = 10) {
    return useQuery({
        queryKey: ['game-questions', 'recall', limit],
        queryFn: () => fetchRecallQuestions(limit),
        enabled: false, // Manual trigger with refetch()
        staleTime: 0, // Always get fresh questions for new games
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}
