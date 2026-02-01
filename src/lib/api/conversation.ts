/**
 * Conversation API functions
 */

import { api } from '../api';

// Types matching backend schemas
export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  correction?: GrammarCorrection;
}

export interface ScenarioInfo {
  id: string;
  name: string;
  role: string;
  userRole: string;
  userGoal: string;
  vocabulary: string[];
}

export interface ConversationStartResponse {
  session_id: string;
  opening_message: string;
  topic?: string;
  target_words?: string[];
  scenario?: string;
  scenario_name?: string;
  user_role?: string;
  user_goal?: string;
}

export interface ConversationOptions {
  topic?: string;
  targetWords?: string[];
  scenario?: string;
}

export interface ConversationResponse {
  reply: string;
  followUp: string;
  correction?: GrammarCorrection;
  session_id?: string;
}

export interface ConversationFeedbackResponse {
  feedback: string;
  session_id: string;
}

// Session storage for conversation
let currentSessionId: string | null = null;

/**
 * Get available conversation scenarios
 */
export async function getScenarios(): Promise<ScenarioInfo[]> {
  const response = await api.get<{ scenarios: ScenarioInfo[] }>('/api/conversation/scenarios');
  return response.scenarios;
}

/**
 * Start a new conversation session
 */
export async function startConversation(
  options?: ConversationOptions
): Promise<ConversationStartResponse> {
  const response = await api.post<ConversationStartResponse>('/api/conversation/start', {
    topic: options?.topic,
    target_words: options?.targetWords,
    scenario: options?.scenario,
  });
  currentSessionId = response.session_id;
  return response;
}

/**
 * Send a message in the conversation
 */
export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<ConversationResponse> {
  const response = await api.post<ConversationResponse>('/api/conversation/message', {
    message,
    session_id: sessionId || currentSessionId,
  });

  if (response.session_id) {
    currentSessionId = response.session_id;
  }

  return response;
}

/**
 * Get the opening message for a new conversation
 * This starts a new session and returns the opening message
 */
export function getOpeningMessage(): ConversationMessage {
  // Start a new session in the background
  startConversation().then(response => {
    currentSessionId = response.session_id;
  }).catch(console.error);

  // Return a default opening message while the session starts
  const openings = [
    "Hi there! I'm excited to practice English with you today. So, what did you do this morning?",
    "Hey! Great to meet you. Let's have a nice chat. What's your favorite way to spend a free afternoon?",
    "Hello! I'm here to help you practice English. Tell me, what's something you're looking forward to this week?",
  ];

  return {
    id: 'opening',
    role: 'assistant',
    content: openings[Math.floor(Math.random() * openings.length)],
  };
}

/**
 * Generate feedback for the conversation
 */
export async function generateFeedback(sessionId?: string): Promise<string> {
  const response = await api.post<ConversationFeedbackResponse>('/api/conversation/feedback', {
    session_id: sessionId || currentSessionId,
  });
  return response.feedback;
}

/**
 * Get current session ID
 */
export function getCurrentSessionId(): string | null {
  return currentSessionId;
}

/**
 * Clear current session
 */
export function clearSession(): void {
  currentSessionId = null;
}

export default {
  getScenarios,
  startConversation,
  sendMessage,
  getOpeningMessage,
  generateFeedback,
  getCurrentSessionId,
  clearSession,
};
