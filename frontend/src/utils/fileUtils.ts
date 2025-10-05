// 文件类型检测工具函数

export enum FileType {
  MARKDOWN = 'markdown',
  TEXT = 'text',
  CODE = 'code',
  UNKNOWN = 'unknown'
}

export interface FileTypeInfo {
  type: FileType;
  extension: string;
  mimeType?: string;
}

/**
 * 根据文件名或内容检测文件类型
 */
export const detectFileType = (filename?: string, content?: string): FileTypeInfo => {
  // 如果有文件名，优先根据扩展名判断
  if (filename) {
    const extension = getFileExtension(filename).toLowerCase();
    
    // Markdown 文件
    if (['.md', '.markdown', '.mdown', '.mkdn', '.mkd', '.mdwn', '.mdtxt', '.mdtext', '.text'].includes(extension)) {
      return {
        type: FileType.MARKDOWN,
        extension,
        mimeType: 'text/markdown'
      };
    }
    
    // 代码文件
    if (['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd'].includes(extension)) {
      return {
        type: FileType.CODE,
        extension,
        mimeType: 'text/plain'
      };
    }
    
    // 文本文件
    if (['.txt', '.text', '.log', '.cfg', '.conf', '.ini', '.yaml', '.yml', '.json', '.xml', '.csv'].includes(extension)) {
      return {
        type: FileType.TEXT,
        extension,
        mimeType: 'text/plain'
      };
    }
  }
  
  // 如果没有文件名或无法识别扩展名，尝试根据内容判断
  if (content) {
    // 检测 Markdown 语法
    if (isMarkdownContent(content)) {
      return {
        type: FileType.MARKDOWN,
        extension: '.md',
        mimeType: 'text/markdown'
      };
    }
    
    // 检测代码语法
    if (isCodeContent(content)) {
      return {
        type: FileType.CODE,
        extension: '.txt',
        mimeType: 'text/plain'
      };
    }
  }
  
  // 默认为文本文件
  return {
    type: FileType.TEXT,
    extension: '.txt',
    mimeType: 'text/plain'
  };
};

/**
 * 获取文件扩展名
 */
export const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return filename.substring(lastDotIndex);
};

/**
 * 检测内容是否为 Markdown 格式
 */
export const isMarkdownContent = (content: string): boolean => {
  const markdownPatterns = [
    /^#{1,6}\s+/m,           // 标题 (# ## ###)
    /^\*\s+/m,               // 无序列表 (*)
    /^-\s+/m,                // 无序列表 (-)
    /^\+\s+/m,               // 无序列表 (+)
    /^\d+\.\s+/m,            // 有序列表 (1. 2. 3.)
    /^\s*>\s+/m,             // 引用 (>)
    /```[\s\S]*?```/m,       // 代码块 (```)
    /`[^`]+`/m,              // 行内代码 (`)
    /\[([^\]]+)\]\(([^)]+)\)/m, // 链接 [text](url)
    /!\[([^\]]*)\]\(([^)]+)\)/m, // 图片 ![alt](url)
    /^\s*\|.*\|.*\|/m,       // 表格 (| col1 | col2 |)
    /^\s*[-*_]{3,}\s*$/m,    // 分割线 (--- *** ___)
    /^\s*={3,}\s*$/m,        // 标题下划线 (===)
    /^\s*-{3,}\s*$/m,        // 标题下划线 (---)
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
};

/**
 * 检测内容是否为代码格式
 */
export const isCodeContent = (content: string): boolean => {
  const codePatterns = [
    /^\s*(function|class|def|import|export|const|let|var|if|for|while|switch|case|try|catch|throw)\s+/m, // 常见编程关键字
    /^\s*\/\/.*$/m,          // 单行注释 (//)
    /^\s*\/\*[\s\S]*?\*\//m, // 多行注释 (/* */)
    /^\s*#.*$/m,             // Python/Shell 注释 (#)
    /^\s*<!--[\s\S]*?-->/m,  // HTML 注释 (<!-- -->)
    /<[^>]+>/m,              // HTML/XML 标签
    /^\s*\{\s*$/m,           // JSON/JS 对象开始
    /^\s*\}\s*$/m,           // JSON/JS 对象结束
    /^\s*\[\s*$/m,           // 数组开始
    /^\s*\]\s*$/m,           // 数组结束
  ];
  
  return codePatterns.some(pattern => pattern.test(content));
};

/**
 * 获取文件类型的显示名称
 */
export const getFileTypeDisplayName = (fileType: FileType): string => {
  switch (fileType) {
    case FileType.MARKDOWN:
      return 'Markdown';
    case FileType.CODE:
      return '代码';
    case FileType.TEXT:
      return '文本';
    default:
      return '未知';
  }
};

/**
 * 获取文件类型的图标
 */
export const getFileTypeIcon = (fileType: FileType): string => {
  switch (fileType) {
    case FileType.MARKDOWN:
      return '📝';
    case FileType.CODE:
      return '💻';
    case FileType.TEXT:
      return '📄';
    default:
      return '📁';
  }
};
