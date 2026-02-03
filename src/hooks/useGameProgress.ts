/**
 * useGameProgress Hook
 * 
 * Handles recording game progress (XP, words learned, time spent) when a game ends.
 * This automatically updates the user's streak and achievements.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { recordActivity } from '@/lib/api/progress';

interface UseGameProgressOptions {
    /** Game state - must include "playing" and "ended" states */
    gameState: string;
    /** Current score from the game */
    score: number;
    /** Number of questions answered correctly or words learned */
    wordsLearned?: number;
    /** XP multiplier (default: score / 10) */
    xpMultiplier?: number;
}

interface UseGameProgressReturn {
    /** Whether progress has been recorded for this game session */
    progressRecorded: boolean;
    /** Reset the progress recorded flag (call when starting a new game) */
    resetProgress: () => void;
    /** Current streak after recording (if available) */
    currentStreak: number | null;
    /** New achievements unlocked (if any) */
    newAchievements: string[];
}

export function useGameProgress({
    gameState,
    score,
    wordsLearned = 0,
    xpMultiplier = 0.1,
}: UseGameProgressOptions): UseGameProgressReturn {
    const queryClient = useQueryClient();
    const [progressRecorded, setProgressRecorded] = useState(false);
    const [currentStreak, setCurrentStreak] = useState<number | null>(null);
    const [newAchievements, setNewAchievements] = useState<string[]>([]);
    const gameStartTimeRef = useRef<number>(0);

    // Track when game starts (any state other than ready or ended means game is active)
    useEffect(() => {
        if (gameState !== "ready" && gameState !== "ended" && gameStartTimeRef.current === 0) {
            gameStartTimeRef.current = Date.now();
        }
    }, [gameState]);

    // Record progress when game ends
    useEffect(() => {
        if (gameState === "ended" && !progressRecorded && score > 0) {
            const doRecordProgress = async () => {
                try {
                    const timeSpent = Math.round((Date.now() - gameStartTimeRef.current) / 60000);
                    const response = await recordActivity({
                        xp: Math.round(score * xpMultiplier),
                        wordsLearned: wordsLearned,
                        timeSpentMinutes: Math.max(1, timeSpent),
                    });

                    setProgressRecorded(true);
                    setCurrentStreak(response.currentStreak);
                    setNewAchievements(response.newAchievements || []);
                    console.log("Game progress recorded:", response);

                    // Invalidate stats queries so dashboard will refresh automatically
                    queryClient.invalidateQueries({ queryKey: ['learning-stats'] });
                    queryClient.invalidateQueries({ queryKey: ['user'] });
                } catch (error) {
                    console.error("Failed to record game progress:", error);
                }
            };
            doRecordProgress();
        }
    }, [gameState, progressRecorded, score, wordsLearned, xpMultiplier, queryClient]);

    const resetProgress = useCallback(() => {
        setProgressRecorded(false);
        setCurrentStreak(null);
        setNewAchievements([]);
        gameStartTimeRef.current = Date.now();
    }, []);

    return {
        progressRecorded,
        resetProgress,
        currentStreak,
        newAchievements,
    };
}

export default useGameProgress;
