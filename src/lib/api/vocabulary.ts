/**
 * Vocabulary API functions
 */

import { api } from '../api';

// Types matching backend schemas
export interface Pronunciation {
  ipa: string;
  phoneticBreakdown: string;
  oxfordRespelling: string;
}

export interface WordStructure {
  prefix: string | null;
  prefixMeaning: string | null;
  root: string;
  rootMeaning: string;
  suffix: string | null;
  suffixMeaning: string | null;
}

export interface WordMeaning {
  context: string;
  meaning: string;
  example: string;
}

export interface Synonym {
  word: string;
  meaning: string;
  context: string;
  interchangeable: 'yes' | 'sometimes' | 'no';
}

export interface CommonMistake {
  incorrect: string;
  issue: string;
  correct: string;
}

export interface WordDefinition {
  word: string;
  partOfSpeech: string;
  definition: string;
  pronunciation: Pronunciation;
  wordStructure: WordStructure;
  etymology: string;
  meanings: WordMeaning[];
  collocations: string[];
  synonyms: Synonym[];
  learningTip: string;
  visualTrick: string;
  memoryPhrase: string;
  commonMistakes?: CommonMistake[];
}

/**
 * Look up a word and get comprehensive definition
 */
export async function lookupWord(word: string): Promise<WordDefinition | null> {
  try {
    const response = await api.post<WordDefinition>('/api/vocabulary/lookup', { word });
    return response;
  } catch (error) {
    console.error('Error looking up word:', error);
    return null;
  }
}

export default {
  lookupWord,
};
