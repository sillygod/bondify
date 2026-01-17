/**
 * Wordlist API functions
 */

import { api } from '../api';

// Types matching backend schemas
export interface WordlistEntry {
    id: number;
    word: string;
    definition: string;
    part_of_speech: string;
    difficulty?: number;
    added_at: string;
    last_reviewed?: string;
    review_count: number;
    mastery_level: number;
    notes?: string;
    full_definition?: Record<string, unknown>;
}

export interface WordlistResponse {
    total: number;
    words: WordlistEntry[];
}

export interface WordlistStats {
    total_words: number;
    words_mastered: number;
    words_learning: number;
    words_new: number;
    average_mastery: number;
}

export interface AddWordRequest {
    word: string;
    notes?: string;
}

export interface UpdateWordRequest {
    notes?: string;
    mastery_level?: number;
}

export interface RandomWordsRequest {
    count?: number;
    topic?: string;
    min_mastery?: number;
    max_mastery?: number;
}

export interface RandomWord {
    word: string;
    definition: string;
    part_of_speech: string;
    mastery_level: number;
}

/**
 * Get user's complete word list
 */
export async function getUserWordlist(): Promise<WordlistResponse> {
    return api.get<WordlistResponse>('/api/wordlist');
}

/**
 * Add a word to user's word list
 */
export async function addToWordlist(word: string, notes?: string): Promise<WordlistEntry> {
    return api.post<WordlistEntry>('/api/wordlist', { word, notes });
}

/**
 * Remove a word from user's word list
 */
export async function removeFromWordlist(word: string): Promise<void> {
    await api.delete(`/api/wordlist/${encodeURIComponent(word)}`);
}

/**
 * Update a word list entry
 */
export async function updateWordlistEntry(
    word: string,
    data: UpdateWordRequest
): Promise<WordlistEntry> {
    return api.patch<WordlistEntry>(`/api/wordlist/${encodeURIComponent(word)}`, data);
}

/**
 * Get wordlist statistics
 */
export async function getWordlistStats(): Promise<WordlistStats> {
    return api.get<WordlistStats>('/api/wordlist/stats');
}

/**
 * Get random words from wordlist for practice
 */
export async function getRandomWords(
    options?: RandomWordsRequest
): Promise<{ words: RandomWord[] }> {
    return api.post<{ words: RandomWord[] }>('/api/wordlist/random', options || {});
}

/**
 * Check if a word is in user's wordlist
 */
export async function isWordInList(wordlist: WordlistEntry[], word: string): boolean {
    return wordlist.some(entry => entry.word.toLowerCase() === word.toLowerCase());
}

export default {
    getUserWordlist,
    addToWordlist,
    removeFromWordlist,
    updateWordlistEntry,
    getWordlistStats,
    getRandomWords,
    isWordInList,
};
