/**
 * Game-SRS Integration Hook
 * 
 * Tracks missed words during games and automatically adds them to SRS.
 */

import { useState, useCallback } from "react";
import { useAddWord } from "@/hooks/useWordlist";
import { tokenManager } from "@/lib/api";

interface MissedWord {
    word: string;
    definition?: string;
    addedToSRS: boolean;
}

/**
 * Hook to manage game → SRS integration.
 * 
 * When a player answers incorrectly, call `recordMissedWord` to:
 * 1. Track the missed word for end-of-game summary
 * 2. Automatically add it to the user's wordlist (triggers SRS)
 */
export function useGameSRS() {
    const [missedWords, setMissedWords] = useState<MissedWord[]>([]);
    const addWordMutation = useAddWord();

    /**
     * Record a missed word and add it to SRS.
     * Only adds if:
     * - User is authenticated
     * - Word hasn't already been recorded this session
     */
    const recordMissedWord = useCallback((word: string, definition?: string) => {
        // Check if already recorded
        if (missedWords.some(m => m.word.toLowerCase() === word.toLowerCase())) {
            return;
        }

        const isAuthenticated = tokenManager.isAuthenticated();

        // Track the missed word
        const missedWord: MissedWord = {
            word,
            definition,
            addedToSRS: false,
        };

        if (isAuthenticated) {
            // Add to wordlist (which triggers SRS card creation)
            addWordMutation.mutate(
                { word, notes: "Added from game (missed answer)" },
                {
                    onSuccess: () => {
                        setMissedWords(prev =>
                            prev.map(m =>
                                m.word === word ? { ...m, addedToSRS: true } : m
                            )
                        );
                    },
                    onError: (error) => {
                        // Word might already exist in wordlist - that's okay
                        console.log("Could not add word to SRS:", error);
                    }
                }
            );
        }

        setMissedWords(prev => [...prev, missedWord]);
    }, [missedWords, addWordMutation]);

    /**
     * Reset missed words for a new game session.
     */
    const resetMissedWords = useCallback(() => {
        setMissedWords([]);
    }, []);

    /**
     * Get count of words successfully added to SRS.
     */
    const addedCount = missedWords.filter(m => m.addedToSRS).length;

    return {
        missedWords,
        recordMissedWord,
        resetMissedWords,
        addedCount,
        isAdding: addWordMutation.isPending,
    };
}
