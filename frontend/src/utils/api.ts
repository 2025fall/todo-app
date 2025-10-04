import axios from 'axios';
import { User, Todo, TodoCreate, TodoUpdate, TodoListResponse, TodoStats, FilterOptions } from '../types';

const API_BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('=== API REQUEST ===');
  console.log('Method:', config.method?.toUpperCase());
  console.log('URL:', config.baseURL + config.url);
  console.log('Token available:', !!token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Headers:', config.headers);
  } else {
    console.log('No token found in localStorage');
  }
  console.log('Data:', config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('=== API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('URL:', response.config.url);
    console.log('Data:', response.data);
    return response;
  },
  (error) => {
    console.log('=== API ERROR ===');
    console.log('Error:', error);
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
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

    const response = await api.get(`/todos/?${params.toString()}`);
    return response.data;
  },

  getTodoStats: async (): Promise<TodoStats> => {
    const response = await api.get('/todos/stats');
    return response.data;
  },

  createTodo: async (todo: TodoCreate): Promise<Todo> => {
    const response = await api.post('/todos/', todo);
    return response.data;
  },

  updateTodo: async (id: number, todo: TodoUpdate): Promise<Todo> => {
    const response = await api.put(`/todos/${id}`, todo);
    return response.data;
  },

  deleteTodo: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },

  getTodo: async (id: number): Promise<Todo> => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  }
};

export { api };