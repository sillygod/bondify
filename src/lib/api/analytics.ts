/**
 * Analytics API functions
 */

import { api } from '../api';

// Types matching backend schemas
export interface PartOfSpeechStats {
    partOfSpeech: string;
    totalAnswers: number;
    correctAnswers: number;
    accuracy: number;
    errorRate: number;
}

export interface WeakWord {
    word: string;
    partOfSpeech: string | null;
    totalAttempts: number;
    correctCount: number;
    accuracy: number;
    errorRate: number;
}

export interface GameTypeStats {
    gameType: string;
    totalAnswers: number;
    correctAnswers: number;
    accuracy: number;
}

export interface WeaknessAnalysisResponse {
    totalAnswers: number;
    correctAnswers: number;
    overallAccuracy: number;
    byPartOfSpeech: PartOfSpeechStats[];
    topWeakWords: WeakWord[];
    byGameType: GameTypeStats[];
    periodDays: number;
}

export interface RecordAnswerRequest {
    word: string;
    gameType: string;
    isCorrect: boolean;
    partOfSpeech?: string;
    questionType?: string;
    userAnswer?: string;
    correctAnswer?: string;
}

/**
 * Get weakness analysis report
 */
export async function getWeaknessAnalysis(days: number = 30): Promise<WeaknessAnalysisResponse> {
    const response = await api.get<WeaknessAnalysisResponse>(`/api/analytics/weakness?days=${days}`);
    return response;
}

/**
 * Record an answer for analytics
 */
export async function recordAnswer(data: RecordAnswerRequest): Promise<{ success: boolean; recordId: number }> {
    const response = await api.post<{ success: boolean; recordId: number }>('/api/analytics/record', data);
    return response;
}

export default {
    getWeaknessAnalysis,
    recordAnswer,
};
