/**
 * Wordlist Hooks
 * 
 * TanStack Query hooks for wordlist operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getUserWordlist,
    addToWordlist,
    removeFromWordlist,
    updateWordlistEntry,
    getWordlistStats,
    WordlistResponse,
    WordlistEntry,
    WordlistStats,
    UpdateWordRequest,
} from "@/lib/api/wordlist";

/**
 * Hook for fetching user's wordlist with caching.
 */
export function useWordlist() {
    return useQuery({
        queryKey: ['wordlist'],
        queryFn: getUserWordlist,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Hook for fetching wordlist statistics.
 */
export function useWordlistStats() {
    return useQuery({
        queryKey: ['wordlist-stats'],
        queryFn: getWordlistStats,
        staleTime: 60 * 1000, // 1 minute
    });
}

/**
 * Hook for adding a word to the wordlist.
 */
export function useAddWord() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ word, notes }: { word: string; notes?: string }) =>
            addToWordlist(word, notes),
        onSuccess: (newEntry) => {
            // Update wordlist cache
            queryClient.setQueryData<WordlistResponse>(['wordlist'], (old) => {
                if (!old) return { total: 1, words: [newEntry] };
                return {
                    total: old.total + 1,
                    words: [newEntry, ...old.words],
                };
            });
            // Invalidate stats
            queryClient.invalidateQueries({ queryKey: ['wordlist-stats'] });
        },
    });
}

/**
 * Hook for removing a word from the wordlist.
 */
export function useRemoveWord() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (word: string) => removeFromWordlist(word),
        onSuccess: (_, word) => {
            // Update wordlist cache
            queryClient.setQueryData<WordlistResponse>(['wordlist'], (old) => {
                if (!old) return old;
                return {
                    total: old.total - 1,
                    words: old.words.filter(
                        (entry) => entry.word.toLowerCase() !== word.toLowerCase()
                    ),
                };
            });
            // Invalidate stats
            queryClient.invalidateQueries({ queryKey: ['wordlist-stats'] });
        },
    });
}

/**
 * Hook for updating a wordlist entry.
 */
export function useUpdateWord() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ word, data }: { word: string; data: UpdateWordRequest }) =>
            updateWordlistEntry(word, data),
        onSuccess: (updatedEntry) => {
            // Update wordlist cache
            queryClient.setQueryData<WordlistResponse>(['wordlist'], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    words: old.words.map((entry) =>
                        entry.word.toLowerCase() === updatedEntry.word.toLowerCase()
                            ? updatedEntry
                            : entry
                    ),
                };
            });
        },
    });
}
