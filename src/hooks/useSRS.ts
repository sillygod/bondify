/**
 * SRS (Spaced Repetition System) Hooks
 * 
 * TanStack Query hooks for the FSRS-powered spaced repetition system.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getDueWords,
    recordReview,
    getSRSStats,
    getReviewForecast,
    DueWordsResponse,
    ReviewResponse,
    SRSStats,
    ForecastResponse,
} from "@/lib/api/srs";

// Query keys
export const srsKeys = {
    all: ["srs"] as const,
    due: (limit?: number) => [...srsKeys.all, "due", limit] as const,
    stats: () => [...srsKeys.all, "stats"] as const,
    forecast: (days?: number) => [...srsKeys.all, "forecast", days] as const,
};

/**
 * Hook for fetching words due for review.
 */
export function useDueWords(limit = 20) {
    return useQuery<DueWordsResponse>({
        queryKey: srsKeys.due(limit),
        queryFn: () => getDueWords(limit),
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Hook for recording a review result.
 * Automatically invalidates due words and stats queries on success.
 */
export function useRecordReview() {
    const queryClient = useQueryClient();

    return useMutation<ReviewResponse, Error, { wordId: number; rating: 1 | 2 | 3 | 4 }>({
        mutationFn: ({ wordId, rating }) => recordReview(wordId, rating),
        onSuccess: () => {
            // Invalidate due words to refresh the list
            queryClient.invalidateQueries({ queryKey: srsKeys.all });
            // Also invalidate wordlist stats
            queryClient.invalidateQueries({ queryKey: ["wordlist-stats"] });
        },
    });
}

/**
 * Hook for fetching SRS statistics.
 */
export function useSRSStats() {
    return useQuery<SRSStats>({
        queryKey: srsKeys.stats(),
        queryFn: getSRSStats,
        staleTime: 60 * 1000, // 1 minute
    });
}

/**
 * Hook for fetching review forecast.
 */
export function useReviewForecast(days = 7) {
    return useQuery<ForecastResponse>({
        queryKey: srsKeys.forecast(days),
        queryFn: () => getReviewForecast(days),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
