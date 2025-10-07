import { useEffect, useRef, useState } from 'react';
import { devError } from '../utils/devLogger';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = ({ data, onSave, delay = 800, enabled = true }: UseAutoSaveOptions) => {
  const [status, setStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedDataRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || !data || JSON.stringify(data) === JSON.stringify(lastSavedDataRef.current)) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await onSave(data);
        lastSavedDataRef.current = data;
        setStatus(`已自动保存 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`);
        
        // 3秒后清除状态
        setTimeout(() => setStatus(''), 3000);
      } catch (error) {
        devError('自动保存失败:', error);
        setStatus('自动保存失败');
        setTimeout(() => setStatus(''), 5000);
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled]);

  return { status, isSaving };
};
