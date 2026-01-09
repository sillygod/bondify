/**
 * Authentication API functions
 */

import { api, tokenManager, ApiRequestError } from '../api';

// Request/Response types
export interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/**
 * Register a new user account
 */
export async function register(data: RegisterRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/api/auth/register', data, false);
  // Store tokens after successful registration
  tokenManager.setTokens(response.access_token, response.refresh_token);
  return response;
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/api/auth/login', data, false);
  // Store tokens after successful login
  tokenManager.setTokens(response.access_token, response.refresh_token);
  return response;
}

/**
 * Refresh the access token using the refresh token
 */
export async function refreshToken(): Promise<TokenResponse> {
  const currentRefreshToken = tokenManager.getRefreshToken();
  if (!currentRefreshToken) {
    throw new ApiRequestError(
      'No refresh token available',
      'AUTH_NO_REFRESH_TOKEN',
      'Please log in again.',
      401
    );
  }

  const response = await api.post<TokenResponse>(
    '/api/auth/refresh',
    { refresh_token: currentRefreshToken },
    false
  );
  // Update stored tokens
  tokenManager.setTokens(response.access_token, response.refresh_token);
  return response;
}

/**
 * Logout - clear stored tokens
 */
export function logout(): void {
  tokenManager.clearTokens();
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return tokenManager.isAuthenticated();
}

export default {
  register,
  login,
  refreshToken,
  logout,
  isAuthenticated,
};
