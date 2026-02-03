/**
 * Reading Mode Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getArticles,
    getArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    analyzeArticle,
    CreateArticleRequest,
    UpdateArticleRequest,
    ReadingAnalysis,
} from '@/lib/api/reading';

const ARTICLES_KEY = ['reading', 'articles'];
const ANALYSIS_KEY = ['reading', 'analysis'];

/**
 * Hook for fetching user's articles list
 */
export function useArticles(limit = 50, offset = 0) {
    return useQuery({
        queryKey: [...ARTICLES_KEY, limit, offset],
        queryFn: () => getArticles(limit, offset),
    });
}

/**
 * Hook for fetching a single article
 */
export function useArticle(id: number | null) {
    return useQuery({
        queryKey: [...ARTICLES_KEY, id],
        queryFn: () => getArticle(id!),
        enabled: id !== null,
    });
}

/**
 * Hook for creating a new article
 */
export function useCreateArticle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateArticleRequest) => createArticle(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ARTICLES_KEY });
        },
    });
}

/**
 * Hook for updating an article
 */
export function useUpdateArticle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateArticleRequest }) =>
            updateArticle(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ARTICLES_KEY });
        },
    });
}

/**
 * Hook for deleting an article
 */
export function useDeleteArticle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteArticle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ARTICLES_KEY });
        },
    });
}

/**
 * Hook for AI article analysis
 * Returns a mutation that can be triggered on demand
 */
export function useArticleAnalysis(articleId: number | null) {
    const queryClient = useQueryClient();

    // Check if we have cached analysis
    const cachedAnalysis = useQuery({
        queryKey: [...ANALYSIS_KEY, articleId],
        queryFn: () => analyzeArticle(articleId!),
        enabled: false, // Don't auto-fetch, only fetch on demand
        staleTime: Infinity, // Never mark as stale since we cache on server
    });

    // Mutation for triggering analysis
    const analysisMutation = useMutation({
        mutationFn: () => analyzeArticle(articleId!),
        onSuccess: (data) => {
            // Cache the result
            queryClient.setQueryData([...ANALYSIS_KEY, articleId], data);
        },
    });

    return {
        analysis: cachedAnalysis.data as ReadingAnalysis | undefined,
        isAnalyzing: analysisMutation.isPending,
        analyzeError: analysisMutation.error,
        triggerAnalysis: () => analysisMutation.mutate(),
        hasAnalysis: !!cachedAnalysis.data,
    };
}
