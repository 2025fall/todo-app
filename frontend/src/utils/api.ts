import axios, { AxiosHeaders } from 'axios';
import { User, Todo, TodoCreate, TodoUpdate, TodoListResponse, TodoStats, FilterOptions } from '../types';
import { saveTodoListCache, getCachedTodoList } from './offlineCache';
import { devLog, devError } from './devLogger';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  devLog('=== API REQUEST ===');
  devLog('Method:', config.method?.toUpperCase());
  const base = config.baseURL ?? '';
  const url = config.url ?? '';
  devLog('URL:', `${base}${url}`);
  devLog('Token available:', !!token);
  if (token) {
    const headers =
      config.headers instanceof AxiosHeaders
        ? config.headers
        : new AxiosHeaders(config.headers ?? undefined);

    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
    devLog('Headers:', headers.toJSON());
  } else {
    devLog('No token found in localStorage');
  }
  devLog('Data:', config.data);
  return config;
});

const isBrowser = typeof window !== 'undefined';
const isOffline = () => isBrowser && navigator.onLine === false;

api.interceptors.response.use(
  (response) => {
    devLog('=== API RESPONSE ===');
    devLog('Status:', response.status);
    devLog('URL:', response.config.url);
    devLog('Data:', response.data);
    return response;
  },
  (error) => {
    devLog('=== API ERROR ===');
    devError('Error:', error);
    devLog('Status:', error.response?.status);
    devLog('Data:', error.response?.data);
    devLog('Message:', error.message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const todoAPI = {
  getTodos: async (options: FilterOptions & { skip?: number; limit?: number } = {}): Promise<TodoListResponse> => {
    const params = new URLSearchParams();

    if (options.skip !== undefined) params.append('skip', options.skip.toString());
    if (options.limit !== undefined) params.append('limit', options.limit.toString());
    if (options.status) params.append('status', options.status);
    if (options.priority) params.append('priority', options.priority);
    if (options.search) params.append('search', options.search);
    if (options.overdue_only) params.append('overdue_only', 'true');
    if (options.type) params.append('type', options.type);

    if (isOffline()) {
      const cached = getCachedTodoList();
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await api.get(`/todos/?${params.toString()}`);
      saveTodoListCache(response.data);
      return response.data;
    } catch (error) {
      if (isOffline()) {
        const cached = getCachedTodoList();
        if (cached) {
          return cached;
        }
      }
      throw error;
    }
  },

  getTodoStats: async (): Promise<TodoStats> => {
    const response = await api.get('/todos/stats');
    return response.data;
  },

  createTodo: async (todo: TodoCreate): Promise<Todo> => {
    if (isOffline()) {
      throw new Error('Cannot create todos while offline.');
    }
    const response = await api.post('/todos/', todo);
    return response.data;
  },

  updateTodo: async (id: number, todo: TodoUpdate): Promise<Todo> => {
    if (isOffline()) {
      throw new Error('Cannot update todos while offline.');
    }
    const response = await api.put(`/todos/${id}`, todo);
    return response.data;
  },

  deleteTodo: async (id: number): Promise<void> => {
    if (isOffline()) {
      throw new Error('Cannot delete todos while offline.');
    }
    await api.delete(`/todos/${id}`);
  },

  getTodo: async (id: number): Promise<Todo> => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  }
};

export { api };
