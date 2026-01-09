/**
 * Rephrase API functions
 */

import { api } from '../api';

// Types matching backend schemas
export interface GrammarIssue {
  type: string;
  problematic: string;
  explanation: string;
  corrections: string[];
}

export interface RephrasedOption {
  context: string;
  sentence: string;
  whyItWorks: string;
}

export interface RephraseAnalysis {
  originalSentence: string;
  issues: GrammarIssue[];
  rephrasedOptions: RephrasedOption[];
  keyTakeaways: string[];
  bestRecommendation: string;
}

/**
 * Analyze a sentence and get rephrasing suggestions
 */
export async function analyzeAndRephrase(sentence: string): Promise<RephraseAnalysis> {
  const response = await api.post<RephraseAnalysis>('/api/rephrase/analyze', { sentence });
  return response;
}

export default {
  analyzeAndRephrase,
};
