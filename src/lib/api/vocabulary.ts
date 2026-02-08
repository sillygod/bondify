/**
 * Vocabulary API functions
 */

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

// API base URL from environment variable
const API_BASE_URL = (import.meta as { env: { VITE_API_BASE_URL?: string } }).env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Get request headers including AI settings
 */
function getRequestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token
  const accessToken = localStorage.getItem('lexicon_access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Add AI headers from settings
  try {
    const savedSettings = localStorage.getItem("lexicon-settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.ai) {
        if (settings.ai.provider) headers['X-Bondify-AI-Provider'] = settings.ai.provider;
        if (settings.ai.apiKey) headers['X-Bondify-AI-Key'] = settings.ai.apiKey;
        if (settings.ai.model) headers['X-Bondify-AI-Model'] = settings.ai.model;
      }
    }
  } catch {
    // Ignore errors parsing settings
  }

  return headers;
}

/**
 * Look up a word and get comprehensive definition (non-streaming)
 */
export async function lookupWord(word: string): Promise<WordDefinition | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/lookup`, {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      console.error('Error looking up word:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error looking up word:', error);
    return null;
  }
}

/**
 * Try to parse partial JSON, returning successfully parsed portion
 */
function tryParsePartialJson(jsonStr: string): Partial<WordDefinition> | null {
  if (!jsonStr || jsonStr.length < 2) {
    return null;
  }

  // Clean up the string - remove markdown code blocks if present
  let cleaned = jsonStr.trim();

  // Handle full markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n?/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n?/, '');
  }

  // Handle partial markdown code blocks - when streaming, backticks may come separately
  // The stream might send just "json" first before the opening brace
  if (cleaned.startsWith('json')) {
    cleaned = cleaned.replace(/^json\s*/, '');
  }

  // Remove trailing markdown fence
  cleaned = cleaned.replace(/```$/, '');

  // Try to parse as-is first
  try {
    const result = JSON.parse(cleaned);
    console.log('[Stream] Parsed complete JSON:', Object.keys(result));
    return result;
  } catch {
    // Try to fix incomplete JSON by closing open structures
  }

  // Add closing brackets/braces as needed
  let attempt = cleaned;

  // Remove trailing comma if present before closing
  attempt = attempt.replace(/,\s*$/, '');

  // Count open/close brackets
  const openBraces = (attempt.match(/{/g) || []).length;
  const closeBraces = (attempt.match(/}/g) || []).length;
  const openBrackets = (attempt.match(/\[/g) || []).length;
  const closeBrackets = (attempt.match(/]/g) || []).length;

  // Close any open strings (rough heuristic)
  const quoteCount = (attempt.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    attempt += '"';
  }

  // Close brackets then braces
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    attempt += ']';
  }
  for (let i = 0; i < openBraces - closeBraces; i++) {
    attempt += '}';
  }

  try {
    const result = JSON.parse(attempt);
    console.log('[Stream] Parsed partial JSON, keys:', Object.keys(result));
    return result;
  } catch (e) {
    // Log for debugging, but only every 50 chars
    if (cleaned.length % 100 < 10) {
      console.log('[Stream] Cannot parse yet, length:', cleaned.length, 'snippet:', cleaned.substring(0, 100));
    }
    return null;
  }
}

/**
 * Stream vocabulary lookup with progressive updates
 * @param word The word to look up
 * @param onUpdate Callback called with partial data as it becomes available
 * @param onComplete Callback called when streaming is complete
 * @param onError Callback called if an error occurs
 */
export async function lookupWordStream(
  word: string,
  onUpdate: (partial: Partial<WordDefinition>) => void,
  onComplete: (full: WordDefinition | null) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/lookup/stream`, {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      onError(`Server error: ${response.status}`);
      return;
    }

    if (!response.body) {
      onError('No response body');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';
    let lastParsedData: Partial<WordDefinition> | null = null;

    console.log('[Stream] Starting to read SSE stream...');

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('[Stream] Stream ended. Final accumulated length:', accumulatedContent.length);
        break;
      }

      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            console.log('[Stream] Received [DONE] signal');
            // Streaming complete - try final parse
            const finalData = tryParsePartialJson(accumulatedContent);
            console.log('[Stream] Final parse result:', finalData ? 'success' : 'null');
            onComplete(finalData as WordDefinition | null);
            return;
          }

          // Check for error
          if (data.startsWith('{"error"')) {
            try {
              const errorObj = JSON.parse(data);
              onError(errorObj.detail || errorObj.error);
              return;
            } catch {
              onError('Unknown error');
              return;
            }
          }

          // Accumulate the content - unescape newlines that were escaped for SSE transport
          accumulatedContent += data.replace(/\\n/g, '\n');

          // Try to parse the accumulated JSON
          const parsed = tryParsePartialJson(accumulatedContent);
          if (parsed && JSON.stringify(parsed) !== JSON.stringify(lastParsedData)) {
            lastParsedData = parsed;
            console.log('[Stream] Calling onUpdate with keys:', Object.keys(parsed));
            onUpdate(parsed);
          }
        }
      }
    }

    // Final parse attempt
    console.log('[Stream] Out of loop, attempting final parse...');
    const finalData = tryParsePartialJson(accumulatedContent);
    console.log('[Stream] Final data:', finalData ? Object.keys(finalData) : 'null');
    onComplete(finalData as WordDefinition | null);

  } catch (error) {
    console.error('Streaming error:', error);
    onError(error instanceof Error ? error.message : 'Unknown error');
  }
}

export default {
  lookupWord,
  lookupWordStream,
};
