import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Todo, TodoCreate, TodoUpdate, TaskStatus, Priority, FilterOptions, ItemType } from '../types';
import { todoAPI } from '../utils/api';
import { Plus, Search, Trash2, FileText, BookOpen, CheckSquare, Menu, X, Eye, Edit3 } from 'lucide-react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import CommandPalette from '../components/CommandPalette';
import Badge from '../components/Badge';
import SkeletonLoader from '../components/SkeletonLoader';
import { detectFileType, FileType, getFileTypeDisplayName, getFileTypeIcon } from '../utils/fileUtils';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { getCachedTodoList, getTodoCacheTimestamp } from '../utils/offlineCache';
import { devLog, devError } from '../utils/devLogger';

const MarkdownRenderer = React.lazy(() => import('../components/MarkdownRenderer'));


const TodoPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTodo, setSelectedTodo] = useState<Todo | undefined>();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('');
  const isOnline = useNetworkStatus();
  const [isCacheFallback, setIsCacheFallback] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 编辑设置状态
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 16,
    lineHeight: 1.6,
  });

  // 阅读模式状态
  const [isReadMode, setIsReadMode] = useState(false);
  const [detectedFileType, setDetectedFileType] = useState<FileType>(FileType.TEXT);

  // 新的表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    due_date: '',
    tags: '',
    type: ItemType.TASK,
    content: '',
    attachments: [] as string[],
  });

  const [filters, setFilters] = useState<FilterOptions>({
    status: undefined,
    priority: undefined,
    search: '',
    overdue_only: false,
    type: undefined,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  // 自动保存定时器
  const [autoSaveTimer, setAutoSaveTimer] = useState<number | null>(null);

  const fetchTodos = useCallback(async (page = pagination.page) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      devLog('=== FETCHING TODOS ===');
      devLog('Filters:', filters);
      devLog('Page:', page);

      const response = await todoAPI.getTodos({
        ...filters,
        skip: (page - 1) * 20,
        limit: 20,
      });

      devLog('=== TODO RESPONSE ===');
      devLog('Response:', response);
      devLog('Todos count:', response.todos.length);
      devLog('Total:', response.total);

      setTodos(response.todos);
      setPagination({
        page: response.page,
        total: response.total,
        totalPages: response.total_pages,
      });

      if (isOnline) {
        setIsCacheFallback(false);
        setLastSyncedAt(Date.now());
      } else {
        setIsCacheFallback(true);
        const cachedTimestamp = getTodoCacheTimestamp();
        setLastSyncedAt(cachedTimestamp);
      }
    } catch (error) {
      devError('Failed to fetch todos:', error);

      const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
      if (offline) {
        const cached = getCachedTodoList();
        if (cached) {
          setTodos(cached.todos);
          setPagination({
            page: cached.page,
            total: cached.total,
            totalPages: cached.total_pages,
          });
          setIsCacheFallback(true);
          const cachedTimestamp = getTodoCacheTimestamp();
          setLastSyncedAt(cachedTimestamp);
          return;
        }
        setErrorMessage('Offline mode: no cached data available.');
      } else {
        setErrorMessage('Failed to fetch todos. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, isOnline, pagination.page]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // 自动保存功能
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(async () => {
      if (selectedTodo && formData.title.trim()) {
        try {
          const submitData: TodoUpdate = {
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            status: formData.status,
            priority: formData.priority,
            due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
            tags: formData.tags.trim() || undefined,
            type: formData.type,
            content: formData.content.trim() || undefined,
          };

          await todoAPI.updateTodo(selectedTodo.id, submitData);
          setAutoSaveStatus(`已自动保存 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`);
          
          // 3秒后清除状态
          setTimeout(() => setAutoSaveStatus(''), 3000);
        } catch (error) {
          devError('Auto-save failed:', error);
          setAutoSaveStatus('自动保存失败');
        }
      }
    }, 800);

    setAutoSaveTimer(timer);
  }, [selectedTodo, formData]);

  // 监听表单变化，触发自动保存
  useEffect(() => {
    if (selectedTodo && formData.title.trim()) {
      triggerAutoSave();
    }
  }, [formData, selectedTodo, triggerAutoSave]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  // 键盘快捷键
  const handleNewItem = useCallback((type: ItemType) => {
    resetForm();
    setFormData(prev => ({ ...prev, type }));
    setShowCommandPalette(false);
  }, [setFormData]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      due_date: '',
      tags: '',
      type: ItemType.TASK,
      content: '',
      attachments: [],
    });
    setSelectedTodo(undefined);
    setIsReadMode(false);
    setDetectedFileType(FileType.TEXT);
  };

  const handleCreateTodoDirect = useCallback(async () => {
    if (!formData.title.trim()) return;
    if (!isOnline) {
      setErrorMessage('Offline mode: please reconnect before creating new items.');
      return;
    }

    try {
      const submitData: TodoCreate = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
        tags: formData.tags.trim() || undefined,
        type: formData.type,
        content: formData.content.trim() || undefined,
      };

      devLog('=== CREATING TODO ===');
      devLog('Submit data:', submitData);
      
      const createdTodo = await todoAPI.createTodo(submitData);
      devLog('=== TODO CREATED ===');
      devLog('Created todo:', createdTodo);
      
      // 重置表单
      resetForm();
      
      // 直接刷新数据，不需要重置过滤条件
      await fetchTodos();
      
      devLog('=== DATA REFRESHED ===');
    } catch (error) {
      devError('Failed to create todo:', error);
      setErrorMessage('Failed to create todo. Please try again.');
    }
  }, [formData, fetchTodos, isOnline]);

  const handleSave = useCallback(() => {
    if (selectedTodo) {
      handleUpdateTodo(new Event('submit') as any);
    } else {
      handleCreateTodoDirect();
    }
  }, [selectedTodo, handleCreateTodoDirect]);

  const handleCancel = useCallback(() => {
    if (selectedTodo) {
      resetForm();
    }
  }, [selectedTodo]);

  const handleContentKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      const textarea = event.currentTarget;
      const { selectionStart, selectionEnd, value } = textarea;
      const newValue = `${value.slice(0, selectionStart)}\n${value.slice(selectionEnd)}`;
      setFormData(prev => ({ ...prev, content: newValue }));
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      });
    }
  }, [setFormData]);

  useKeyboardShortcuts({
    onNewItem: () => setShowCommandPalette(true),
    onSave: handleSave,
    onCommandPalette: () => setShowCommandPalette(true),
    onCancel: handleCancel
  });

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (!isOnline) {
      setErrorMessage('Offline mode: please reconnect before creating new items.');
      return;
    }

    try {
      const submitData: TodoCreate = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
        tags: formData.tags.trim() || undefined,
        type: formData.type,
        content: formData.content.trim() || undefined,
      };

      devLog('=== CREATING TODO ===');
      devLog('Submit data:', submitData);
      
      const createdTodo = await todoAPI.createTodo(submitData);
      devLog('=== TODO CREATED ===');
      devLog('Created todo:', createdTodo);
      
      // 重置表单
      resetForm();
      
      // 直接刷新数据，不需要重置过滤条件
      await fetchTodos();
      
      devLog('=== DATA REFRESHED ===');
    } catch (error) {
      devError('Failed to create todo:', error);
      setErrorMessage('Failed to create todo. Please try again.');
    }
  };

  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTodo || !formData.title.trim()) return;
    if (!isOnline) {
      setErrorMessage('Offline mode: please reconnect before updating items.');
      return;
    }

    try {
      const submitData: TodoUpdate = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
        tags: formData.tags.trim() || undefined,
        type: formData.type,
        content: formData.content.trim() || undefined,
      };

      devLog('=== UPDATING TODO ===');
      devLog('Update data:', submitData);
      
      const updatedTodo = await todoAPI.updateTodo(selectedTodo.id, submitData);
      devLog('=== TODO UPDATED ===');
      devLog('Updated todo:', updatedTodo);
      
      resetForm();
      await fetchTodos();
      
      devLog('=== DATA REFRESHED ===');
    } catch (error) {
      devError('Failed to update todo:', error);
      setErrorMessage('Failed to update todo. Please try again.');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    if (!confirm('确定要删除这个任务吗？')) return;

    try {
      if (!isOnline) {
        setErrorMessage('Offline mode: please reconnect before deleting items.');
        return;
      }
      devLog('=== DELETING TODO ===');
      devLog('Todo ID:', id);
      
      await todoAPI.deleteTodo(id);
      devLog('=== TODO DELETED ===');
      
      if (selectedTodo?.id === id) {
        resetForm();
      }
      await fetchTodos();
      
      devLog('=== DATA REFRESHED ===');
    } catch (error) {
      devError('Failed to delete todo:', error);
      setErrorMessage('Failed to delete todo. Please try again.');
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      status: todo.status,
      priority: todo.priority,
      due_date: todo.due_date ? todo.due_date.split('T')[0] : '',
      tags: todo.tags || '',
      type: todo.type || ItemType.TASK,
      content: todo.content || '',
      attachments: [],
    });
    
    // 检测文件类型
    const fileTypeInfo = detectFileType(todo.title, todo.content || todo.description || '');
    setDetectedFileType(fileTypeInfo.type);
    
    // 如果是 Markdown 文件，默认进入阅读模式
    if (fileTypeInfo.type === FileType.MARKDOWN) {
      setIsReadMode(true);
    } else {
      setIsReadMode(false);
    }
    
    // 移动端选择条目后自动关闭侧边栏
    setShowMobileSidebar(false);
  };

  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case ItemType.TASK: return <CheckSquare className="h-4 w-4 text-blue-500" />;
      case ItemType.NOTE: return <FileText className="h-4 w-4 text-green-500" />;
      case ItemType.DIARY: return <BookOpen className="h-4 w-4 text-purple-500" />;
      default: return <CheckSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: ItemType) => {
    switch (type) {
      case ItemType.TASK: return '任务';
      case ItemType.NOTE: return '笔记';
      case ItemType.DIARY: return '日记';
      default: return '任务';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return '刚刚';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* 移动端顶部导航 */}
      {/* Offline status banners */}
      {isCacheFallback && (
        <div className="w-full px-4 py-2 bg-amber-50 border-b border-amber-200 text-sm text-amber-900 flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
          <span>Offline mode: showing the last synced data.</span>
          {lastSyncedAt && (
            <span className="text-xs text-amber-700 lg:text-sm">
              Last synced {new Date(lastSyncedAt).toLocaleString()}
            </span>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="w-full px-4 py-2 bg-red-50 border-b border-red-200 text-sm text-red-900">
          {errorMessage}
        </div>
      )}

      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Todo App</h1>
        </div>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">赵</span>
        </div>
      </div>

      {/* 移动端侧边栏遮罩 */}
      {showMobileSidebar && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* 左侧侧边栏 - 固定宽度，类似飞书设计 */}
      <div className={`w-72 bg-white border-r border-gray-200 flex flex-col ${
        showMobileSidebar ? 'fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto' : 'hidden lg:flex'
      }`}>
        {/* 应用标题和用户信息区域 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">Todo App</h1>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">新</span>
              </div>
              {/* 移动端关闭按钮 */}
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="lg:hidden p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* 搜索框 - 更现代的设计 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索任务、笔记、日记..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm placeholder-gray-400"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          {/* 筛选按钮 - 扁平化标签风格 */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilters({ ...filters, type: undefined })}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all duration-200 ${
                !filters.type 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilters({ ...filters, type: ItemType.TASK })}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all duration-200 ${
                filters.type === ItemType.TASK 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              任务
            </button>
            <button
              onClick={() => setFilters({ ...filters, type: ItemType.NOTE })}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all duration-200 ${
                filters.type === ItemType.NOTE 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              笔记
            </button>
            <button
              onClick={() => setFilters({ ...filters, type: ItemType.DIARY })}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all duration-200 ${
                filters.type === ItemType.DIARY 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              日记
            </button>
          </div>
        </div>

        {/* 条目列表 - 类似飞书的会话列表 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <SkeletonLoader type="list" count={5} />
          ) : todos.length === 0 ? (
            <div className="text-center py-12 text-gray-500 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">开始创建你的第一个条目</h3>
              <p className="text-sm text-gray-500 mb-4">在右侧创建任务、笔记或日记</p>
              
              {/* 快捷键提示 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">快捷键提示</p>
                <div className="flex flex-wrap justify-center gap-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">K</kbd>
                    <span className="text-gray-500">命令面板</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">N</kbd>
                    <span className="text-gray-500">快速新建</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">S</kbd>
                    <span className="text-gray-500">保存</span>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-400">点击下方按钮开始创建</p>
            </div>
          ) : (
            <div className="px-2 py-2">
              {todos.map((todo) => (
                <button
                  key={todo.id}
                  role="option"
                  aria-selected={selectedTodo?.id === todo.id}
                  className={`w-full text-left group relative mx-2 mb-1 p-3 rounded-xl transition-all duration-200 ${
                    selectedTodo?.id === todo.id 
                      ? 'bg-blue-50/70 border border-blue-200 before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-blue-500 before:rounded-r' 
                      : 'hover:bg-blue-50'
                  }`}
                  onClick={() => handleEditTodo(todo)}
                >
                  <div className="flex items-start space-x-3">
                    {/* 类型图标 */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        todo.type === ItemType.TASK ? 'bg-blue-100' :
                        todo.type === ItemType.NOTE ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {getTypeIcon(todo.type || ItemType.TASK)}
                      </div>
                    </div>
                    
                    {/* 三行结构内容区域 */}
                    <div className="flex-1 min-w-0">
                      {/* 第一行：标题 (semibold) */}
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`text-sm font-semibold truncate ${
                          todo.type === ItemType.TASK && todo.status === TaskStatus.DONE ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {todo.title}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(todo.created_at)}
                        </span>
                      </div>
                      
                      {/* 第二行：类型徽章和状态 */}
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge 
                          variant="soft" 
                          color={
                            todo.type === ItemType.TASK ? 'blue' :
                            todo.type === ItemType.NOTE ? 'green' : 'purple'
                          }
                          size="sm"
                        >
                          {getTypeLabel(todo.type || ItemType.TASK)}
                        </Badge>
                        {/* 只有任务才显示状态指示器 */}
                        {todo.type === ItemType.TASK && todo.status && (
                          <div className={`w-2 h-2 rounded-full ${
                            todo.status === TaskStatus.DONE ? 'bg-green-500' :
                            todo.status === TaskStatus.DOING ? 'bg-blue-500' : 'bg-gray-400'
                          }`}></div>
                        )}
                      </div>
                      
                      {/* 第三行：预览 (灰更浅，单行截断) */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 line-clamp-1 truncate flex-1">
                          {todo.content || todo.description || '暂无内容'}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTodo(todo.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200 ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 右侧主内容区 - 全屏可编辑模式 */}
      <div className="flex-1 flex flex-col bg-white min-w-0 h-full lg:h-auto">
        {selectedTodo ? (
          <div className="h-full flex flex-col">
            {/* Sticky 顶部工具栏 */}
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 z-10">
              <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-4">
                  {/* 类型选择 */}
                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-2">
                    {Object.values(ItemType).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                          formData.type === type
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {getTypeIcon(type)}
                        <span>{getTypeLabel(type)}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* 分隔线 */}
                  <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                  
                  {/* 字体大小控制 */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-sm text-gray-500">字体:</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditorSettings(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 2) }))}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <span className="text-sm">A</span>
                      </button>
                      <span className="text-sm text-gray-600 w-8 text-center">{editorSettings.fontSize}px</span>
                      <button
                        onClick={() => setEditorSettings(prev => ({ ...prev, fontSize: Math.min(24, prev.fontSize + 2) }))}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <span className="text-base">A</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* 行间距控制 */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-sm text-gray-500">行距:</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditorSettings(prev => ({ ...prev, lineHeight: Math.max(1.2, prev.lineHeight - 0.1) }))}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <span className="text-xs">-</span>
                      </button>
                      <span className="text-sm text-gray-600 w-8 text-center">{editorSettings.lineHeight.toFixed(1)}</span>
                      <button
                        onClick={() => setEditorSettings(prev => ({ ...prev, lineHeight: Math.min(2.5, prev.lineHeight + 0.1) }))}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <span className="text-xs">+</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* 阅读/编辑模式切换 */}
                  {selectedTodo && (
                    <>
                      <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="text-sm text-gray-500">模式:</span>
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setIsReadMode(true)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                              isReadMode 
                                ? 'bg-white text-blue-700 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            <Eye className="h-3 w-3" />
                            <span>阅读</span>
                          </button>
                          <button
                            onClick={() => setIsReadMode(false)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                              !isReadMode 
                                ? 'bg-white text-blue-700 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>编辑</span>
                          </button>
                        </div>
                        {/* 文件类型指示器 */}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <span>{getFileTypeIcon(detectedFileType)}</span>
                          <span>{getFileTypeDisplayName(detectedFileType)}</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* 只有任务类型才显示状态和优先级选择 */}
                  {formData.type === ItemType.TASK && (
                    <>
                      <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                      <select
                        className="w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                      >
                        <option value={TaskStatus.TODO}>待办</option>
                        <option value={TaskStatus.DOING}>进行中</option>
                        <option value={TaskStatus.DONE}>已完成</option>
                      </select>
                      
                      <select
                        className="w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                      >
                        <option value={Priority.LOW}>低优先级</option>
                        <option value={Priority.MEDIUM}>中优先级</option>
                        <option value={Priority.HIGH}>高优先级</option>
                        <option value={Priority.URGENT}>紧急</option>
                      </select>
                    </>
                  )}
                </div>
                
                {/* 右侧操作按钮 */}
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
                  <div className="hidden lg:flex items-center space-x-1 text-xs text-gray-500">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">S</kbd>
                  </div>
                  {selectedTodo && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                      取消
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    className="btn-primary text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{selectedTodo ? '保存' : '创建'}</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* 全屏编辑区域 */}
            <div className="flex-1 overflow-hidden">
              <form onSubmit={selectedTodo ? handleUpdateTodo : handleCreateTodo} className="h-full flex flex-col">
                {/* 标题编辑区域 */}
                <div className="border-b border-gray-100">
                  <input
                    type="text"
                    required
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-xl sm:text-2xl font-semibold bg-transparent border-none outline-none placeholder-gray-400"
                    placeholder="输入标题..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      fontSize: `${Math.max(20, editorSettings.fontSize + 4)}px`,
                      lineHeight: editorSettings.lineHeight,
                    }}
                  />
                </div>
                
                {/* 内容编辑区域 */}
                <div className="flex-1 relative">
                  {isReadMode ? (
                    /* 阅读模式 - Markdown 渲染 */
                    <div className="absolute inset-0 px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto">
                      {detectedFileType === FileType.MARKDOWN ? (
                        <Suspense fallback={<div className="text-sm text-gray-500">Markdown loading...</div>}>
                          <MarkdownRenderer 
                            content={formData.content || formData.description || ''} 
                            className="prose prose-gray max-w-none"
                          />
                        </Suspense>
                      ) : (
                        /* 普通文本显示 */
                        <div 
                          className="whitespace-pre-wrap text-gray-700 leading-relaxed"
                          style={{
                            fontSize: `${editorSettings.fontSize}px`,
                            lineHeight: editorSettings.lineHeight,
                          }}
                        >
                          {formData.content || formData.description || '暂无内容'}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 编辑模式 - 文本输入 */
                    <textarea
                      className="w-full h-full px-4 sm:px-6 py-3 sm:py-4 resize-none border-none outline-none bg-transparent placeholder-gray-400"
                      placeholder={formData.type === ItemType.TASK ? '详细描述任务内容...' : '输入内容...'}
                      value={formData.content}
                    onKeyDown={handleContentKeyDown}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      style={{
                        fontSize: `${editorSettings.fontSize}px`,
                        lineHeight: editorSettings.lineHeight,
                      }}
                    />
                  )}
                  
                  {/* 自动保存状态 */}
                  {autoSaveStatus && !isReadMode && (
                    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg shadow-sm border border-green-200">
                      {autoSaveStatus}
                    </div>
                  )}
                  
                  {/* 阅读模式提示 */}
                  {isReadMode && (
                    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg shadow-sm border border-blue-200">
                      阅读模式 - 点击"编辑"按钮进行修改
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* 空状态时的顶部工具栏 */}
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 z-10">
              <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-4">
                  {/* 类型选择 */}
                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-2">
                    {Object.values(ItemType).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                          formData.type === type
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {getTypeIcon(type)}
                        <span>{getTypeLabel(type)}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* 分隔线 */}
                  <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                  
                  {/* 字体大小控制 */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-sm text-gray-500">字体:</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditorSettings(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 2) }))}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <span className="text-sm">A</span>
                      </button>
                      <span className="text-sm text-gray-600 w-8 text-center">{editorSettings.fontSize}px</span>
                      <button
                        onClick={() => setEditorSettings(prev => ({ ...prev, fontSize: Math.min(24, prev.fontSize + 2) }))}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <span className="text-base">A</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* 行间距控制 */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-sm text-gray-500">行距:</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditorSettings(prev => ({ ...prev, lineHeight: Math.max(1.2, prev.lineHeight - 0.1) }))}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <span className="text-xs">-</span>
                      </button>
                      <span className="text-sm text-gray-600 w-8 text-center">{editorSettings.lineHeight.toFixed(1)}</span>
                      <button
                        onClick={() => setEditorSettings(prev => ({ ...prev, lineHeight: Math.min(2.5, prev.lineHeight + 0.1) }))}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <span className="text-xs">+</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* 阅读/编辑模式切换 */}
                  {selectedTodo && (
                    <>
                      <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="text-sm text-gray-500">模式:</span>
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setIsReadMode(true)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                              isReadMode 
                                ? 'bg-white text-blue-700 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            <Eye className="h-3 w-3" />
                            <span>阅读</span>
                          </button>
                          <button
                            onClick={() => setIsReadMode(false)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                              !isReadMode 
                                ? 'bg-white text-blue-700 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>编辑</span>
                          </button>
                        </div>
                        {/* 文件类型指示器 */}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <span>{getFileTypeIcon(detectedFileType)}</span>
                          <span>{getFileTypeDisplayName(detectedFileType)}</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* 只有任务类型才显示状态和优先级选择 */}
                  {formData.type === ItemType.TASK && (
                    <>
                      <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                      <select
                        className="w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                      >
                        <option value={TaskStatus.TODO}>待办</option>
                        <option value={TaskStatus.DOING}>进行中</option>
                        <option value={TaskStatus.DONE}>已完成</option>
                      </select>
                      
                      <select
                        className="w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                      >
                        <option value={Priority.LOW}>低优先级</option>
                        <option value={Priority.MEDIUM}>中优先级</option>
                        <option value={Priority.HIGH}>高优先级</option>
                        <option value={Priority.URGENT}>紧急</option>
                      </select>
                    </>
                  )}
                </div>
                
                {/* 右侧操作按钮 */}
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
                  <div className="hidden lg:flex items-center space-x-1 text-xs text-gray-500">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">S</kbd>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="btn-primary text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>创建</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* 创建新条目的编辑区域 */}
            <div className="flex-1 overflow-hidden">
              <form onSubmit={handleCreateTodo} className="h-full flex flex-col">
                {/* 标题编辑区域 */}
                <div className="border-b border-gray-100">
                  <input
                    type="text"
                    required
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-xl sm:text-2xl font-semibold bg-transparent border-none outline-none placeholder-gray-400"
                    placeholder="输入标题..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      fontSize: `${Math.max(20, editorSettings.fontSize + 4)}px`,
                      lineHeight: editorSettings.lineHeight,
                    }}
                  />
                </div>
                
                {/* 内容编辑区域 */}
                <div className="flex-1 relative">
                  <textarea
                    className="w-full h-full px-4 sm:px-6 py-3 sm:py-4 resize-none border-none outline-none bg-transparent placeholder-gray-400"
                    placeholder={formData.type === ItemType.TASK ? '详细描述任务内容...' : '输入内容...'}
                    value={formData.content}
                    onKeyDown={handleContentKeyDown}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    style={{
                      fontSize: `${editorSettings.fontSize}px`,
                      lineHeight: editorSettings.lineHeight,
                    }}
                  />
                  
                  {/* 创建提示 */}
                  <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 text-xs text-gray-400">
                    输入内容后点击右上角"创建"按钮或使用 ⌘+S 保存
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 命令面板 */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNewItem={handleNewItem}
        onSearch={(query) => {
          // 可以在这里实现搜索功能
          devLog('Search query:', query);
        }}
      />
    </div>
  );
};

export default TodoPage;
