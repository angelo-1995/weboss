import { useAuthStore } from '@/features/auth/stores/auth.store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    public override message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private isRefreshing = false;

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const { accessToken } = useAuthStore.getState();

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
    });

    if (res.status === 401 && !this.isRefreshing) {
      const refreshed = await this.attemptRefresh();
      if (refreshed) {
        return this.request<T>(path, options);
      }
      // Refresh failed — clear and redirect
      useAuthStore.getState().clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new ApiError(401, 'Sesión expirada');
    }

    if (!res.ok) {
      let body: any = {};
      try {
        const text = await res.text();
        body = text ? JSON.parse(text) : {};
      } catch {
        body = {};
      }
      throw new ApiError(res.status, body.message || 'Error del servidor', body.field);
    }

    // Handle 204 No Content
    if (res.status === 204) return undefined as T;

    // Parse JSON response safely
    try {
      const text = await res.text();
      if (!text || text.trim().length === 0) return undefined as T;
      return JSON.parse(text) as T;
    } catch {
      return undefined as T;
    }
  }

  private async attemptRefresh(): Promise<boolean> {
    this.isRefreshing = true;
    try {
      const { refreshToken, setTokens } = useAuthStore.getState();
      if (!refreshToken) return false;

      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const tokens = await res.json();
      setTokens(tokens);
      return true;
    } catch {
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    let url = path;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
