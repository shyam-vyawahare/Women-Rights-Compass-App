import { API_URL } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
}

export interface ApiError {
  response?: {
    data: any;
    status: number;
  };
  message?: string;
}

class ApiService {
  private async request<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = await AsyncStorage.getItem('auth_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user');
      }

      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // eslint-disable-next-line no-throw-literal
        throw { response: { data, status: response.status } } as ApiError;
      }

      return { data: data as T, status: response.status };
    } catch (error) {
      if ((error as ApiError).response) {
        throw error;
      }
      throw { message: (error as Error).message } as ApiError;
    }
  }

  async get<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { 
      ...options, 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    });
  }

  async put<T = any>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { 
      ...options, 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    });
  }

  async delete<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

const api = new ApiService();
export default api;
