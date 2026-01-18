/**
 * Shared constants for admin pages
 */

export interface GameType {
    id: string;
    label: string;
    description: string;
}

export const GAME_TYPES: GameType[] = [
    { id: "clarity", label: "Clarity", description: "Simplify wordy phrases" },
    { id: "transitions", label: "Transitions", description: "Choose transition words" },
    { id: "brevity", label: "Brevity", description: "Make sentences concise" },
    { id: "context", label: "Context", description: "Vocabulary in context" },
    { id: "diction", label: "Diction", description: "Word choice correctness" },
    { id: "punctuation", label: "Punctuation", description: "Punctuation practice" },
    { id: "listening", label: "Listening", description: "Conversation comprehension" },
    { id: "speed_reading", label: "Speed Reading", description: "Reading comprehension" },
    { id: "word_parts", label: "Word Parts", description: "Etymology breakdown" },
    { id: "rocket", label: "Rocket", description: "Synonym matching" },
    { id: "rephrase", label: "Rephrase", description: "Sentence improvement" },
    { id: "recall", label: "Recall", description: "Word recall from definition" },
    { id: "attention", label: "Attention", description: "Listening categorization" },
    { id: "pronunciation", label: "Pronunciation", description: "Common mispronunciations" },
];

// Just the IDs for quick filtering
export const GAME_TYPE_IDS = GAME_TYPES.map(t => t.id);
