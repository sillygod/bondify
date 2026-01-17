/**
 * Admin API Client
 * Centralized functions for admin operations
 */

export interface Question {
    id: number;
    game_type: string;
    difficulty: string;
    is_reviewed: boolean;
    question_json?: string; // Sometimes returned as string in DB objects
    [key: string]: any;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// Helper for requests
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetch questions by game type
 */
export async function getQuestions(gameType: string, limit = 50): Promise<{ questions: Question[] }> {
    return request<{ questions: Question[] }>(`/api/game-questions/${gameType}?limit=${limit}`);
}

/**
 * Update review status
 */
export async function updateReviewStatus(id: number, reviewed: boolean): Promise<any> {
    return request(`/api/game-questions/${id}/review?reviewed=${reviewed}`, {
        method: "PATCH",
    });
}

/**
 * Delete a question
 */
export async function deleteQuestion(id: number): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/game-questions/${id}`, {
        method: "DELETE",
    });
}

/**
 * Update a question's content
 */
export async function updateQuestion(id: number, updates: Partial<Question>): Promise<Question> {
    return request<Question>(`/api/game-questions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
    });
}
