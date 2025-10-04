export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  due_date?: string;
  tags?: string;
  user_id: number;
  created_at: string;
  updated_at?: string;
  type: ItemType;
  content?: string; // 用于笔记和日记的正文内容
}

export interface TodoCreate {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  due_date?: string;
  tags?: string;
  type: ItemType;
  content?: string;
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  due_date?: string;
  tags?: string;
  type?: ItemType;
  content?: string;
}

export interface TodoListResponse {
  todos: Todo[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface TodoStats {
  total: number;
  todo_count: number;
  doing_count: number;
  done_count: number;
  overdue_count: number;
}

export enum TaskStatus {
  TODO = "TODO",
  DOING = "DOING",
  DONE = "DONE"
}

export enum Priority {
  URGENT = "URGENT",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW"
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FilterOptions {
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
  overdue_only?: boolean;
  type?: ItemType;
}

export enum ItemType {
  TASK = "TASK",
  NOTE = "NOTE", 
  DIARY = "DIARY"
}