import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: 'user' | 'advocate' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'user' | 'advocate' | 'admin';
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    await this.saveAuth(response.data);
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    await this.saveAuth(response.data);
    return response.data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
  }

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  private async saveAuth(authData: AuthResponse): Promise<void> {
    await AsyncStorage.setItem('auth_token', authData.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(authData.user));
  }

  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  }
}

export default new AuthService();