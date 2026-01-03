// ============================================
// FILE: frontend/src/services/apiService.ts
// ============================================
// Path: postfix-dashboard/frontend/src/services/apiService.ts

import { config } from '../config';
import authService from './authService';

interface RequestOptions extends RequestInit {
  timeout?: number;
}

type QueryValue = string | number | boolean | null | undefined;

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private timeout = config.api.timeout;

  private buildUrl(endpoint: string, params?: Record<string, QueryValue>): string {
    // Always use /api path - works for both development (Vite proxy) and production (reverse proxy)
    const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

    if (!params) {
      return url;
    }

    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  private async fetchWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
    const { timeout = this.timeout, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout. Please try again.');
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response, endpoint?: string): Promise<T> {
    // Handle rate limiting (429) - comes from middleware, not backend
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
      throw new ApiError(429, 'Too many requests. Please try again later.', {
        retryAfter: retryAfterSeconds,
      });
    }

    // Parse response data
    let data: unknown;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle unauthorized (401)
    if (response.status === 401) {
      // Only treat as session expired if it's not a login attempt
      if (endpoint !== '/api/login') {
        authService.clearAuth();
        window.location.href = '/';
        throw new ApiError(401, 'Session expired. Please login again.');
      }
      // For login endpoint, let the error fall through to be handled normally
    }

    if (!response.ok) {
      let message: string | undefined;
      if (typeof data === 'object' && data !== null) {
        const errorData = data as Record<string, unknown>;
        if (typeof errorData.error === 'string') {
          message = errorData.error;
        } else if (typeof errorData.message === 'string') {
          message = errorData.message;
        }
      }

      throw new ApiError(
        response.status,
        message ?? `Request failed with status ${response.status}`,
      );
    }

    return data as T;
  }

  async get<T>(endpoint: string, params?: Record<string, QueryValue>): Promise<T> {
    const url = this.buildUrl(endpoint, params);

    const response = await this.fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
    });

    return this.handleResponse<T>(response, endpoint);
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint);

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response, endpoint);
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint);

    const response = await this.fetchWithTimeout(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response, endpoint);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(endpoint);

    const response = await this.fetchWithTimeout(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeader(),
      },
      ...options,
    });

    return this.handleResponse<T>(response, endpoint);
  }
}

export const apiService = new ApiService();
export { ApiError };
export default apiService;
