const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: T;
  token?: string;
  errors?: Array<{ field: string; message: string }>;
  notes?: T[];
  categories?: T[];
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    console.log('API Request:', {
      url,
      method: config.method,
      headers: config.headers,
      body: config.body
    });

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      console.log('API Response:', {
        status: response.status,
        ok: response.ok,
        data
      });

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error: unknown) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Send OTP
  async sendOTP(email: string, purpose: 'signup' | 'signin', name?: string): Promise<ApiResponse> {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, purpose, name }),
    });
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<ApiResponse> {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  // Sign Up
  async signUp(userData: {
    name: string;
    email: string;
    birthday: string;
    password?: string;
    otp?: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Sign In
  async signIn(credentials: {
    email: string;
    password?: string;
    otp?: string;
    keepLoggedIn?: boolean;
  }): Promise<ApiResponse> {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Get current user
  async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  // Sign Out
  async signOut(): Promise<ApiResponse> {
    return this.request('/auth/signout', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health', {
      method: 'GET',
    });
  }

  // Notes API
  async getNotes(): Promise<ApiResponse> {
    return this.request('/notes', {
      method: 'GET',
    });
  }

  async createNote(noteData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    isPinned: boolean;
  }): Promise<ApiResponse> {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateNote(noteId: string, noteData: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    isPinned: boolean;
  }): Promise<ApiResponse> {
    console.log('Frontend sending update data:', { noteId, noteData });
    return this.request(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(noteId: string): Promise<ApiResponse> {
    return this.request(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // Categories API
  async getCategories(): Promise<ApiResponse> {
    return this.request('/categories', {
      method: 'GET',
    });
  }

  async createCategory(categoryData: {
    name: string;
    color: string;
  }): Promise<ApiResponse> {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(categoryId: string, categoryData: {
    name: string;
    color: string;
  }): Promise<ApiResponse> {
    return this.request(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(categoryId: string): Promise<ApiResponse> {
    return this.request(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService(); 