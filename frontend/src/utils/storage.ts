// 本地存储工具
export class LocalStorage {
  private static prefix = 'todo-app-';

  static set(key: string, value: any): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue || null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

// 草稿管理
export class DraftManager {
  private static DRAFT_KEY = 'drafts';
  private static MAX_DRAFTS = 10;

  static saveDraft(id: string, data: any): void {
    const drafts = this.getDrafts();
    drafts[id] = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    
    // 限制草稿数量
    const draftIds = Object.keys(drafts);
    if (draftIds.length > this.MAX_DRAFTS) {
      const oldestId = draftIds.reduce((oldest, current) => 
        new Date(drafts[current].savedAt) < new Date(drafts[oldest].savedAt) ? current : oldest
      );
      delete drafts[oldestId];
    }
    
    LocalStorage.set(this.DRAFT_KEY, drafts);
  }

  static getDraft(id: string): any | null {
    const drafts = this.getDrafts();
    return drafts[id] || null;
  }

  static getDrafts(): Record<string, any> {
    return LocalStorage.get(this.DRAFT_KEY, {});
  }

  static removeDraft(id: string): void {
    const drafts = this.getDrafts();
    delete drafts[id];
    LocalStorage.set(this.DRAFT_KEY, drafts);
  }

  static clearDrafts(): void {
    LocalStorage.remove(this.DRAFT_KEY);
  }
}

// 离线检测
export class OfflineManager {
  private static listeners: Array<(isOnline: boolean) => void> = [];

  static init(): void {
    window.addEventListener('online', () => this.notifyListeners(true));
    window.addEventListener('offline', () => this.notifyListeners(false));
  }

  static isOnline(): boolean {
    return navigator.onLine;
  }

  static addListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private static notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(callback => callback(isOnline));
  }
}

// 同步队列
export class SyncQueue {
  private static QUEUE_KEY = 'sync-queue';

  static add(action: string, data: any): void {
    const queue = this.getQueue();
    queue.push({
      id: Date.now().toString(),
      action,
      data,
      timestamp: new Date().toISOString(),
    });
    LocalStorage.set(this.QUEUE_KEY, queue);
  }

  static getQueue(): Array<{id: string, action: string, data: any, timestamp: string}> {
    return LocalStorage.get(this.QUEUE_KEY, []);
  }

  static clearQueue(): void {
    LocalStorage.remove(this.QUEUE_KEY);
  }

  static async processQueue(apiCall: (action: string, data: any) => Promise<any>): Promise<void> {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    for (const item of queue) {
      try {
        await apiCall(item.action, item.data);
        // 成功后从队列中移除
        const updatedQueue = queue.filter(q => q.id !== item.id);
        LocalStorage.set(this.QUEUE_KEY, updatedQueue);
      } catch (error) {
        console.error('Failed to sync item:', item, error);
        // 失败时保留在队列中，稍后重试
      }
    }
  }
}
