import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onNewItem?: () => void;
  onSave?: () => void;
  onCommandPalette?: () => void;
  onCancel?: () => void;
}

export const useKeyboardShortcuts = ({
  onNewItem,
  onSave,
  onCommandPalette,
  onCancel
}: KeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 忽略在输入框中的快捷键
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      // 在输入框中只处理特定的快捷键
      if (event.key === 'Enter' && !event.shiftKey && onSave) {
        event.preventDefault();
        onSave();
        return;
      }
      if (event.key === 'Escape' && onCancel) {
        event.preventDefault();
        onCancel();
        return;
      }
      return;
    }

    // 全局快捷键
    switch (event.key.toLowerCase()) {
      case 'n':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          onNewItem?.();
        }
        break;
      case 's':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          onSave?.();
        }
        break;
      case 'k':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          onCommandPalette?.();
        }
        break;
      case 'escape':
        event.preventDefault();
        onCancel?.();
        break;
    }
  }, [onNewItem, onSave, onCommandPalette, onCancel]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
