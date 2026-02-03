/**
 * Reading API functions
 */

import { api } from '../api';

// Types matching backend schemas (snake_case from API)
export interface Article {
  id: number;
  title: string;
  content: string;
  source_url: string | null;
  word_count: number;
  difficulty_level: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleSummary {
  id: number;
  title: string;
  word_count: number;
  difficulty_level: string;
  source_url: string | null;
  created_at: string;
}

export interface ArticleListResponse {
  total: number;
  articles: ArticleSummary[];
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  source_url?: string;
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
}

/**
 * Create a new reading article
 */
export async function createArticle(data: CreateArticleRequest): Promise<Article> {
  return api.post<Article>('/api/reading/articles', data);
}

/**
 * Get user's articles
 */
export async function getArticles(limit = 50, offset = 0): Promise<ArticleListResponse> {
  return api.get<ArticleListResponse>(`/api/reading/articles?limit=${limit}&offset=${offset}`);
}

/**
 * Get a specific article
 */
export async function getArticle(id: number): Promise<Article> {
  return api.get<Article>(`/api/reading/articles/${id}`);
}

/**
 * Update an article
 */
export async function updateArticle(id: number, data: UpdateArticleRequest): Promise<Article> {
  return api.patch<Article>(`/api/reading/articles/${id}`, data);
}

/**
 * Delete an article
 */
export async function deleteArticle(id: number): Promise<void> {
  return api.delete(`/api/reading/articles/${id}`);
}

export interface UrlImportResult {
  title: string;
  content: string;
  sourceUrl: string;
  wordCount: number;
}

/**
 * Extract article content from a URL
 */
export async function importFromUrl(url: string): Promise<UrlImportResult> {
  return api.post<UrlImportResult>('/api/reading/import-url', { url });
}

export default {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  importFromUrl,
};

// =============================================================================
// AI Analysis Types
// =============================================================================

export interface SuggestedWord {
  word: string;
  definition: string;
  contextSentence: string;
}

export interface KeyConcept {
  concept: string;
  explanation: string;
}

export interface GrammarHighlight {
  sentence: string;
  pattern: string;
  explanation: string;
}

export interface ReadingAnalysis {
  summary: string;
  suggestedWords: SuggestedWord[];
  keyConcepts: KeyConcept[];
  grammarHighlights: GrammarHighlight[];
  cached: boolean;
}

/**
 * Analyze article content using AI
 */
export async function analyzeArticle(articleId: number): Promise<ReadingAnalysis> {
  return api.post<ReadingAnalysis>(`/api/reading/articles/${articleId}/analyze`, {});
}
