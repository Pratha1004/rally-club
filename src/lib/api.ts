import {
  User,
  Court,
  Booking,
  CourtBlock,
  ClubSettings,
  AvailabilityResponse,
  DemoAccount,
  SportType
} from '../types.ts';

const TOKEN_KEY = 'rallyclub_auth_token';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn('Could not store token in localStorage', e);
    }
  }

  public clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Could not clear token', e);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.error || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // --- Auth ---
  public auth = {
    getDemoAccounts: () =>
      this.request<{ accounts: DemoAccount[] }>('/api/auth/demo-accounts'),

    login: async (email: string, password: string) => {
      const res = await this.request<{ user: User; token: string; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.token) {
        this.setToken(res.token);
      }
      return res;
    },

    register: async (payload: { name: string; email: string; password: string; phone?: string }) => {
      const res = await this.request<{ user: User; token: string; message: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.token) {
        this.setToken(res.token);
      }
      return res;
    },

    me: async () => {
      return this.request<{ user: User }>('/api/auth/me');
    },

    logout: async () => {
      try {
        await this.request<{ message: string }>('/api/auth/logout', { method: 'POST' });
      } catch (err) {
        console.warn('Logout server request error (clearing local token anyway)', err);
      } finally {
        this.clearToken();
      }
    },

    forgotPassword: (email: string) =>
      this.request<{ message: string; resetToken?: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      }),

    resetPassword: (token: string, newPassword: string) =>
      this.request<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword })
      })
  };

  // --- Courts ---
  public courts = {
    list: () => this.request<{ courts: Court[] }>('/api/courts'),
    update: (id: string, updates: Partial<Court>) =>
      this.request<{ court: Court; message: string }>(`/api/courts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      })
  };

  // --- Availability ---
  public availability = {
    get: (sport: SportType, date: string, duration: 60 | 90 | 120) =>
      this.request<AvailabilityResponse>(
        `/api/availability?sport=${encodeURIComponent(sport)}&date=${encodeURIComponent(date)}&duration=${duration}`
      )
  };

  // --- Bookings ---
  public bookings = {
    list: (params?: { date?: string; sport?: string; status?: string; courtId?: string }) => {
      const query = new URLSearchParams();
      if (params?.date) query.set('date', params.date);
      if (params?.sport) query.set('sport', params.sport);
      if (params?.status) query.set('status', params.status);
      if (params?.courtId) query.set('courtId', params.courtId);
      const qStr = query.toString();
      return this.request<{ bookings: Booking[] }>(`/api/bookings${qStr ? `?${qStr}` : ''}`);
    },

    getById: (id: string) => this.request<{ booking: Booking }>(`/api/bookings/${id}`),

    create: (data: {
      courtId: string;
      date: string;
      startTime: string;
      durationMinutes: 60 | 90 | 120;
      playersCount: number;
      racketRentalCount: number;
      ballTubeCount: number;
      notes?: string;
      paymentMethod: string;
    }) =>
      this.request<{ booking: Booking; message: string }>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    reschedule: (id: string, data: { newDate: string; newStartTime: string; durationMinutes?: number }) =>
      this.request<{ booking: Booking; message: string }>(`/api/bookings/${id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),

    cancel: (id: string) =>
      this.request<{ booking: Booking; message: string }>(`/api/bookings/${id}/cancel`, {
        method: 'POST'
      }),

    updatePayment: (id: string, paymentStatus: string, paymentMethod?: string) =>
      this.request<{ booking: Booking; message: string }>(`/api/bookings/${id}/payment`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentStatus, paymentMethod })
      }),

    checkIn: (id: string) =>
      this.request<{ booking: Booking; message: string }>(`/api/bookings/${id}/check-in`, {
        method: 'POST'
      })
  };

  // --- Court Blocks ---
  public courtBlocks = {
    list: (date?: string) =>
      this.request<{ blocks: CourtBlock[] }>(`/api/court-blocks${date ? `?date=${encodeURIComponent(date)}` : ''}`),

    create: (data: {
      courtId: string;
      date: string;
      startTime: string;
      endTime: string;
      reason: string;
      notes?: string;
    }) =>
      this.request<{ block: CourtBlock; message: string }>('/api/court-blocks', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    remove: (id: string) =>
      this.request<{ message: string }>(`/api/court-blocks/${id}`, {
        method: 'DELETE'
      })
  };

  // --- Admin ---
  public admin = {
    getUsers: () => this.request<{ users: (User & { bookingCount: number; totalSpent: number })[] }>('/api/admin/users'),

    provisionUser: (data: { name: string; email: string; password: string; role: string; phone?: string }) =>
      this.request<{ user: User; message: string }>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    updateUser: (id: string, data: { role?: string; membershipTier?: string }) =>
      this.request<{ user: User; message: string }>(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),

    getAnalytics: () =>
      this.request<{
        totalRevenue: number;
        pendingRevenue: number;
        totalBookingsCount: number;
        padelBookingsCount: number;
        pickleballBookingsCount: number;
        totalMembers: number;
        courtStats: {
          courtId: string;
          courtName: string;
          sport: string;
          bookingCount: number;
          totalHours: number;
          revenue: number;
        }[];
      }>('/api/admin/analytics'),

    getSettings: () => this.request<{ settings: ClubSettings }>('/api/admin/settings'),

    updateSettings: (settings: Partial<ClubSettings>) =>
      this.request<{ settings: ClubSettings; message: string }>('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings)
      })
  };
}

export const api = new ApiClient();
