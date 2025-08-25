const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface SessionResponse {
  user: User;
  agency_code: string;
}

export interface KPIData {
  bookingsToday: number;
  revenue30d: number;
  newClients7d: number;
  noShows7d: number;
}

export interface Client {
  id: number;
  client_name: string;
  email: string;
  phone?: string;
  status?: string;
  created_at?: string;
  last_visit_date?: string;
  stage?: string;
  owner?: string;
  due_date?: string;
  needs_attention?: boolean;
  is_overdue?: boolean;
}

export interface Appointment {
  id: number;
  client_id?: number;
  client_name: string;
  starts_at: string;
  status: string;
  value: number;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<SessionResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
  }

  async getSession(): Promise<SessionResponse> {
    return this.request('/auth/session');
  }

  // Overview endpoints
  async getKPIs(): Promise<KPIData> {
    return this.request('/overview/kpis');
  }

  // Client endpoints
  async getWelcomeClients(): Promise<Client[]> {
    return this.request('/clients/welcome');
  }

  async createWelcomeClient(client: Partial<Client>): Promise<Client> {
    return this.request('/clients/welcome', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  async updateWelcomeClient(id: number, client: Partial<Client>): Promise<Client> {
    return this.request(`/clients/welcome/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(client),
    });
  }

  async getRetargetingClients(): Promise<Client[]> {
    return this.request('/clients/retargeting');
  }

  async sendRetargetingEmail(clientId: number, subject: string, content?: string): Promise<any> {
    return this.request(`/clients/retargeting/${clientId}/email-logs`, {
      method: 'POST',
      body: JSON.stringify({ subject, content }),
    });
  }

  async getFollowupClients(): Promise<Client[]> {
    return this.request('/clients/followups');
  }

  async sendFollowupEmail(clientId: number, subject: string, content?: string): Promise<any> {
    return this.request(`/clients/followups/${clientId}/email-logs`, {
      method: 'POST',
      body: JSON.stringify({ subject, content }),
    });
  }

  async updateFollowupClient(id: number, client: Partial<Client>): Promise<Client> {
    return this.request(`/clients/followups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(client),
    });
  }

  // Appointment endpoints
  async getAppointments(filters?: {
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.status) params.append('status', filters.status);
    
    const query = params.toString();
    return this.request(`/appointments${query ? `?${query}` : ''}`);
  }

  async createAppointment(appointment: Partial<Appointment>): Promise<Appointment> {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  }

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment> {
    return this.request(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(appointment),
    });
  }

  // Reports endpoints
  async exportData(entity: string, format: 'csv' | 'json' = 'json'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/reports/export?entity=${entity}&format=${format}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }
}

export const apiClient = new ApiClient();
