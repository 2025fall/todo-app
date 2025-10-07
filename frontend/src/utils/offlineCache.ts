import { TodoListResponse } from '../types'
import { devWarn } from './devLogger'

const TODO_CACHE_KEY = 'todo-app.todo-cache'

interface CachedTodoList {
  timestamp: number
  payload: TodoListResponse
}

const isBrowser = typeof window !== 'undefined'

export const saveTodoListCache = (payload: TodoListResponse) => {
  if (!isBrowser) {
    return
  }

  const cache: CachedTodoList = {
    timestamp: Date.now(),
    payload,
  }

  try {
    localStorage.setItem(TODO_CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    devWarn('Unable to persist todo cache:', error)
  }
}

export const readTodoListCache = (): CachedTodoList | null => {
  if (!isBrowser) {
    return null
  }

  const raw = localStorage.getItem(TODO_CACHE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as CachedTodoList
  } catch (error) {
    devWarn('Unable to parse todo cache:', error)
    localStorage.removeItem(TODO_CACHE_KEY)
    return null
  }
}

export const getCachedTodoList = (): TodoListResponse | null => {
  const cache = readTodoListCache()
  return cache?.payload ?? null
}

export const getTodoCacheTimestamp = (): number | null => {
  const cache = readTodoListCache()
  return cache?.timestamp ?? null
}
