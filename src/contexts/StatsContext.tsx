/**
 * Stats Context
 * 
 * Provides user stats and user data across the application.
 * Uses TanStack Query for automatic caching and refetching.
 */

import { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tokenManager } from "@/lib/api";
import { getCurrentUser, UserProfile } from "@/lib/api/user";
import { getStats, LearningStats } from "@/lib/api/progress";

interface StatsContextType {
    user: UserProfile | null;
    stats: LearningStats | null;
    isLoading: boolean;
    refreshStats: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType>({
    user: null,
    stats: null,
    isLoading: true,
    refreshStats: async () => { },
});

export const useStats = () => useContext(StatsContext);

interface StatsProviderProps {
    children: ReactNode;
}

export const StatsProvider = ({ children }: StatsProviderProps) => {
    const queryClient = useQueryClient();
    const isAuthenticated = tokenManager.isAuthenticated();

    // Query for user profile
    const userQuery = useQuery({
        queryKey: ['user'],
        queryFn: getCurrentUser,
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
    });

    // Query for learning stats
    const statsQuery = useQuery({
        queryKey: ['learning-stats'],
        queryFn: getStats,
        enabled: isAuthenticated,
        staleTime: 30 * 1000, // 30 seconds - stats change more frequently
        refetchOnWindowFocus: true,
    });

    const refreshStats = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['user'] }),
            queryClient.invalidateQueries({ queryKey: ['learning-stats'] }),
        ]);
    };

    const isLoading = userQuery.isLoading || statsQuery.isLoading;

    return (
        <StatsContext.Provider value={{
            user: userQuery.data ?? null,
            stats: statsQuery.data ?? null,
            isLoading,
            refreshStats,
        }}>
            {children}
        </StatsContext.Provider>
    );
};

export default StatsProvider;
