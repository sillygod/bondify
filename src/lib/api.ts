/**
 * API Client for Backend Integration
 * Handles HTTP requests, JWT token management, and error handling
 */

// API base URL from environment variable
const API_BASE_URL = (import.meta as { env: { VITE_API_BASE_URL?: string } }).env.VITE_API_BASE_URL || 'http://localhost:8000';

// Token storage keys
const ACCESS_TOKEN_KEY = 'lexicon_access_token';
const REFRESH_TOKEN_KEY = 'lexicon_refresh_token';

// Error response interface
export interface ApiError {
  error: string;
  detail: string;
  code: string;
}

// Token management
export const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};

// Custom error class for API errors
export class ApiRequestError extends Error {
  public code: string;
  public detail: string;
  public status: number;

  constructor(message: string, code: string, detail: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.detail = detail;
    this.status = status;
  }
}

// Request options interface
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

// Refresh token function
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      tokenManager.clearTokens();
      return false;
    }

    const data = await response.json();
    tokenManager.setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    tokenManager.clearTokens();
    return false;
  }
}

// Main API request function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, requiresAuth = true } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization header if required and token exists
  if (requiresAuth) {
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      requestHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

  // Handle 401 - try to refresh token
  if (response.status === 401 && requiresAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the request with new token
      const newAccessToken = tokenManager.getAccessToken();
      if (newAccessToken) {
        requestHeaders['Authorization'] = `Bearer ${newAccessToken}`;
        requestOptions.headers = requestHeaders;
        response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
      }
    } else {
      // Redirect to login or handle unauthenticated state
      tokenManager.clearTokens();
      throw new ApiRequestError(
        'Authentication required',
        'AUTH_TOKEN_EXPIRED',
        'Your session has expired. Please log in again.',
        401
      );
    }
  }

  // Parse response
  const contentType = response.headers.get('content-type');
  let data: T | ApiError;

  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = (await response.text()) as unknown as T;
  }

  // Handle error responses
  if (!response.ok) {
    const errorData = data as ApiError;
    throw new ApiRequestError(
      errorData.error || 'Request failed',
      errorData.code || 'UNKNOWN_ERROR',
      errorData.detail || 'An unexpected error occurred',
      response.status
    );
  }

  return data as T;
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'GET', requiresAuth }),

  post: <T>(endpoint: string, body?: unknown, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'POST', body, requiresAuth }),

  put: <T>(endpoint: string, body?: unknown, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'PUT', body, requiresAuth }),

  delete: <T>(endpoint: string, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'DELETE', requiresAuth }),
};

// Health check function
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export default api;
