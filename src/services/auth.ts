interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    akariId: string;
    role: string;
    avatar: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  akariId: string;
  role: string;
  avatar: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;
  private listeners: Set<() => void> = new Set();
  private apiUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('akari_auth');
      if (stored) {
        const { token, user } = JSON.parse(stored);
        this.token = token;
        this.user = user;
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    }
  }

  private save() {
    if (this.token && this.user) {
      localStorage.setItem('akari_auth', JSON.stringify({ token: this.token, user: this.user }));
    } else {
      localStorage.removeItem('akari_auth');
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async login(akariId: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ akariId, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.error || 'Login failed' };
      }

      const data: AuthResponse = await response.json();
      this.token = data.token;
      this.user = data.user;
      this.save();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async logout(): Promise<void> {
    if (this.token) {
      await fetch(`${this.apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      }).catch(() => {});
    }
    this.token = null;
    this.user = null;
    this.save();
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token || !this.user) return null;

    try {
      const response = await fetch(`${this.apiUrl}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${this.token}` },
      });

      if (response.ok) {
        const user = await response.json();
        this.user = user;
        this.save();
        return user;
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    }

    return this.user;
  }

  public isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser(): User | null {
    return this.user;
  }

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`,
      },
    });
  }
}

export const authService = new AuthService();
