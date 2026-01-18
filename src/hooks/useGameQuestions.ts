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

// =============================================================================
// Speed Reading Game
// =============================================================================

export interface SpeedReadingArticle {
    id: number;
    title: string;
    paragraphs: {
        text: string;
        question: {
            text: string;
            options: string[];
            correctIndex: number;
        };
    }[];
    difficulty?: string;
    is_reviewed?: boolean;
}

interface SpeedReadingResponse {
    game_type: string;
    count: number;
    questions: SpeedReadingArticle[];
}

async function fetchSpeedReadingArticle(): Promise<SpeedReadingArticle | null> {
    try {
        // Try reviewed first
        const response = await api.get<SpeedReadingResponse>(
            `/api/game-questions/speed_reading?limit=1&only_reviewed=true&random_order=true`,
            false
        );

        if (response.questions.length > 0) {
            return response.questions[0];
        }

        // Fallback to unreviewed
        const fallback = await api.get<SpeedReadingResponse>(
            `/api/game-questions/speed_reading?limit=1&only_reviewed=false&random_order=true`,
            false
        );

        return fallback.questions.length > 0 ? fallback.questions[0] : null;
    } catch {
        return null;
    }
}

/**
 * Hook for fetching Speed Reading articles.
 * Returns a single article for the game.
 */
export function useSpeedReadingArticle() {
    return useQuery({
        queryKey: ['game-questions', 'speed_reading'],
        queryFn: fetchSpeedReadingArticle,
        enabled: false, // Manual trigger with refetch()
        staleTime: 0, // Always get fresh article for new games
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}

// =============================================================================
// Word Parts Game
// =============================================================================

export interface WordPart {
    type: "prefix" | "root" | "suffix";
    value: string;
    meaning: string;
}

export interface WordPartsQuestion {
    id: number;
    word: string;
    meaning: string;
    parts: WordPart[];
    targetPartIndex: number;
    options: string[];
    difficulty?: string;
    is_reviewed?: boolean;
}

async function fetchWordPartsQuestions(limit: number): Promise<WordPartsQuestion[]> {
    try {
        // Try reviewed first
        const response = await api.get<QuestionsResponse<WordPartsQuestion>>(
            `/api/game-questions/word_parts?limit=${limit}&only_reviewed=true&random_order=true`,
            false
        );

        if (response.questions.length > 0) {
            return response.questions;
        }

        // Fallback to unreviewed
        const fallback = await api.get<QuestionsResponse<WordPartsQuestion>>(
            `/api/game-questions/word_parts?limit=${limit}&only_reviewed=false&random_order=true`,
            false
        );

        return fallback.questions;
    } catch {
        return [];
    }
}

/**
 * Hook for fetching Word Parts questions.
 * Questions are cached and can be refetched on demand.
 */
export function useWordPartsQuestions(limit = 10) {
    return useQuery({
        queryKey: ['game-questions', 'word_parts', limit],
        queryFn: () => fetchWordPartsQuestions(limit),
        enabled: false, // Manual trigger with refetch()
        staleTime: 0, // Always get fresh questions for new games
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}

// =============================================================================
// Context Game
// =============================================================================

export interface ContextQuestion {
    id: number;
    sentence: string;
    correctWord: string;
    options: string[];
    explanation: string;
    difficulty?: string;
    is_reviewed?: boolean;
}

async function fetchContextQuestions(limit: number): Promise<ContextQuestion[]> {
    try {
        // Try reviewed first
        const response = await api.get<QuestionsResponse<ContextQuestion>>(
            `/api/game-questions/context?limit=${limit}&only_reviewed=true&random_order=true`,
            false
        );

        if (response.questions.length > 0) {
            return response.questions;
        }

        // Fallback to unreviewed
        const fallback = await api.get<QuestionsResponse<ContextQuestion>>(
            `/api/game-questions/context?limit=${limit}&only_reviewed=false&random_order=true`,
            false
        );

        return fallback.questions;
    } catch {
        return [];
    }
}

/**
 * Hook for fetching Context vocabulary questions.
 * Questions are cached and can be refetched on demand.
 */
export function useContextQuestions(limit = 10) {
    return useQuery({
        queryKey: ['game-questions', 'context', limit],
        queryFn: () => fetchContextQuestions(limit),
        enabled: false, // Manual trigger with refetch()
        staleTime: 0, // Always get fresh questions for new games
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}

// =============================================================================
// Pronunciation Game
// =============================================================================

export interface PronunciationQuestion {
    id: number;
    word: string;
    definition: string;
    correctPronunciation: string;
    ttsCorrect?: string; // TTS-friendly version of correct pronunciation
    incorrectPronunciations: string[];
    ttsIncorrect?: string[]; // TTS-friendly versions of incorrect pronunciations
    ipaCorrect: string;
    explanation: string;
    difficulty?: string;
    is_reviewed?: boolean;
}

async function fetchPronunciationQuestions(limit: number): Promise<PronunciationQuestion[]> {
    try {
        // Try reviewed first
        const response = await api.get<QuestionsResponse<PronunciationQuestion>>(
            `/api/game-questions/pronunciation?limit=${limit}&only_reviewed=true&random_order=true`,
            false
        );

        if (response.questions.length > 0) {
            return response.questions;
        }

        // Fallback to unreviewed
        const fallback = await api.get<QuestionsResponse<PronunciationQuestion>>(
            `/api/game-questions/pronunciation?limit=${limit}&only_reviewed=false&random_order=true`,
            false
        );

        return fallback.questions;
    } catch {
        return [];
    }
}

/**
 * Hook for fetching Pronunciation questions.
 * Questions are cached and can be refetched on demand.
 */
export function usePronunciationQuestions(limit = 10) {
    return useQuery({
        queryKey: ['game-questions', 'pronunciation', limit],
        queryFn: () => fetchPronunciationQuestions(limit),
        enabled: false, // Manual trigger with refetch()
        staleTime: 0, // Always get fresh questions for new games
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}

// =============================================================================
// Transitions Game
// =============================================================================

export interface TransitionsQuestion {
    id: number;
    paragraph: string;
    options: string[];
    correctOption: string;
    reason: string;
    difficulty?: string;
    is_reviewed?: boolean;
}

async function fetchTransitionsQuestions(limit: number): Promise<TransitionsQuestion[]> {
    try {
        // Try reviewed first
        const response = await api.get<QuestionsResponse<TransitionsQuestion>>(
            `/api/game-questions/transitions?limit=${limit}&only_reviewed=true&random_order=true`,
            false
        );

        if (response.questions.length > 0) {
            return response.questions;
        }

        // Fallback to unreviewed
        const fallback = await api.get<QuestionsResponse<TransitionsQuestion>>(
            `/api/game-questions/transitions?limit=${limit}&only_reviewed=false&random_order=true`,
            false
        );

        return fallback.questions;
    } catch {
        return [];
    }
}

/**
 * Hook for fetching Transitions questions.
 * Questions are cached and can be refetched on demand.
 */
export function useTransitionsQuestions(limit = 10) {
    return useQuery({
        queryKey: ['game-questions', 'transitions', limit],
        queryFn: () => fetchTransitionsQuestions(limit),
        enabled: false, // Manual trigger with refetch()
        staleTime: 0, // Always get fresh questions for new games
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}

// =============================================================================
// Clarity Game
// =============================================================================

export interface ClarityQuestion {
    id: number;
    sentence: string;
    wordyPart: {
        startIndex: number;
        text: string;
    };
    options: string[];
    correctOption: string;
    reason: string;
    difficulty?: string;
    is_reviewed?: boolean;
}

async function fetchClarityQuestions(limit: number): Promise<ClarityQuestion[]> {
    try {
        // Try reviewed first
        const response = await api.get<QuestionsResponse<ClarityQuestion>>(
            `/api/game-questions/clarity?limit=${limit}&only_reviewed=true&random_order=true`,
            false
        );

        if (response.questions.length > 0) {
            return response.questions;
        }

        // Fallback to unreviewed
        const fallback = await api.get<QuestionsResponse<ClarityQuestion>>(
            `/api/game-questions/clarity?limit=${limit}&only_reviewed=false&random_order=true`,
            false
        );

        return fallback.questions;
    } catch {
        return [];
    }
}

/**
 * Hook for fetching Clarity questions.
 * Questions are cached and can be refetched on demand.
 */
export function useClarityQuestions(limit = 10) {
    return useQuery({
        queryKey: ['game-questions', 'clarity', limit],
        queryFn: () => fetchClarityQuestions(limit),
        enabled: false, // Manual trigger with refetch()
        staleTime: 0, // Always get fresh questions for new games
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}

// =============================================================================
// Brevity Game
// =============================================================================

export interface BrevityQuestion {
    id: number;
    originalSentence: string;
    options: string[];
    correctOption: string;
    reason: string;
    difficulty?: string;
    is_reviewed?: boolean;
}

async function fetchBrevityQuestions(limit: number): Promise<BrevityQuestion[]> {
    try {
        // Try reviewed first
        const response = await api.get<QuestionsResponse<BrevityQuestion>>(
            `/api/game-questions/brevity?limit=${limit}&only_reviewed=true&random_order=true`,
            false
        );

        if (response.questions.length > 0) {
            return response.questions;
        }

        // Fallback to unreviewed
        const fallback = await api.get<QuestionsResponse<BrevityQuestion>>(
            `/api/game-questions/brevity?limit=${limit}&only_reviewed=false&random_order=true`,
            false
        );

        return fallback.questions;
    } catch {
        return [];
    }
}

/**
 * Hook for fetching Brevity questions.
 * Questions are cached and can be refetched on demand.
 */
export function useBrevityQuestions(limit = 10) {
    return useQuery({
        queryKey: ['game-questions', 'brevity', limit],
        queryFn: () => fetchBrevityQuestions(limit),
        enabled: false, // Manual trigger with refetch()
        staleTime: 0, // Always get fresh questions for new games
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}

// =============================================================================
// Punctuation Game
// =============================================================================

export interface PunctuationBlank {
    options: string[];
    correctIndex: number;
}

export interface PunctuationAPIQuestion {
    id: number;
    sentence: string;
    blanks: PunctuationBlank[];
    punctuationType: "apostrophe" | "comma" | "hyphen" | "semicolon" | "colon";
    explanation: string;
    difficulty?: string;
    is_reviewed?: boolean;
}

async function fetchPunctuationGameQuestions(limit: number): Promise<PunctuationAPIQuestion[]> {
    try {
        // Try reviewed first
        const response = await api.get<QuestionsResponse<PunctuationAPIQuestion>>(
            `/api/game-questions/punctuation?limit=${limit}&only_reviewed=true&random_order=true`,
            false
        );

        if (response.questions.length > 0) {
            return response.questions;
        }

        // Fallback to unreviewed
        const fallback = await api.get<QuestionsResponse<PunctuationAPIQuestion>>(
            `/api/game-questions/punctuation?limit=${limit}&only_reviewed=false&random_order=true`,
            false
        );

        return fallback.questions;
    } catch {
        return [];
    }
}

/**
 * Hook for fetching Punctuation questions.
 * Questions are cached and can be refetched on demand.
 */
export function usePunctuationGameQuestions(limit = 10) {
    return useQuery({
        queryKey: ['game-questions', 'punctuation', limit],
        queryFn: () => fetchPunctuationGameQuestions(limit),
        enabled: false, // Manual trigger with refetch()
        staleTime: 0, // Always get fresh questions for new games
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}

// =============================================================================
// Attention Game
// =============================================================================

export interface AttentionMainBubble {
    id: string;
    text: string;
    color: "purple" | "cyan" | "orange";
}

export interface AttentionRelatedBubble {
    id: string;
    text: string;
    parentId: string;
}

export interface AttentionAPIArticle {
    id?: number;
    title: string;
    audioText: string;
    mainBubbles: AttentionMainBubble[];
    relatedBubbles: AttentionRelatedBubble[];
    difficulty?: string;
    is_reviewed?: boolean;
}

async function fetchAttentionArticle(): Promise<AttentionAPIArticle | null> {
    try {
        // Try reviewed first
        const response = await api.get<QuestionsResponse<AttentionAPIArticle>>(
            `/api/game-questions/attention?limit=1&only_reviewed=true&random_order=true`,
            false
        );

        if (response.questions.length > 0) {
            return response.questions[0];
        }

        // Fallback to unreviewed
        const fallback = await api.get<QuestionsResponse<AttentionAPIArticle>>(
            `/api/game-questions/attention?limit=1&only_reviewed=false&random_order=true`,
            false
        );

        if (fallback.questions.length > 0) {
            return fallback.questions[0];
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Hook for fetching Attention articles.
 * Articles are cached and can be refetched on demand.
 */
export function useAttentionArticle() {
    return useQuery({
        queryKey: ['game-questions', 'attention'],
        queryFn: () => fetchAttentionArticle(),
        enabled: false, // Manual trigger with refetch()
        staleTime: 0, // Always get fresh article for new games
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    });
}
