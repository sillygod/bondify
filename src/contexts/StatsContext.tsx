/**
 * Stats Context
 * 
 * Provides user stats and user data across the application.
 * Uses TanStack Query for automatic caching and refetching.
 */

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tokenManager } from "@/lib/api";
import { getCurrentUser, UserProfile } from "@/lib/api/user";
import { getStats, LearningStats } from "@/lib/api/progress";

interface StatsContextType {
    user: UserProfile | null;
    stats: LearningStats | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    refreshStats: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType>({
    user: null,
    stats: null,
    isLoading: true,
    isAuthenticated: false,
    login: () => { },
    logout: () => { },
    refreshStats: async () => { },
});

export const useStats = () => useContext(StatsContext);

interface StatsProviderProps {
    children: ReactNode;
}

export const StatsProvider = ({ children }: StatsProviderProps) => {
    const queryClient = useQueryClient();
    // Track token existence locally to ensure reactivity
    const [isAuthenticated, setIsAuthenticated] = useState(tokenManager.isAuthenticated());

    // Listen for storage events to sync across tabs
    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(tokenManager.isAuthenticated());
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = useCallback((accessToken: string, refreshToken: string) => {
        tokenManager.setTokens(accessToken, refreshToken);
        setIsAuthenticated(true);
        // Invalidate queries to fetch new user data immediately
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['learning-stats'] });
    }, [queryClient]);

    const logout = useCallback(() => {
        tokenManager.clearTokens();
        setIsAuthenticated(false);
        queryClient.setQueryData(['user'], null);
        queryClient.setQueryData(['learning-stats'], null);
        queryClient.clear();
    }, [queryClient]);

    // Query for user profile
    const userQuery = useQuery({
        queryKey: ['user'],
        queryFn: getCurrentUser,
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
    });

    // Query for learning stats
    const statsQuery = useQuery({
        queryKey: ['learning-stats'],
        queryFn: getStats,
        enabled: isAuthenticated,
        staleTime: 30 * 1000, // 30 seconds
        retry: false,
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
            isAuthenticated,
            login,
            logout,
            refreshStats,
        }}>
            {children}
        </StatsContext.Provider>
    );
};

export default StatsProvider;
