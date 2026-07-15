import { useState, useCallback, useEffect, useRef } from 'react';

export function useUnsavedChanges(onDirtyChange?: (dirty: boolean) => void) {
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const markClean = useCallback(() => {
    setIsDirty(false);
  }, []);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const requestConfirm = useCallback((action: () => void) => {
    pendingActionRef.current = action;
    setShowConfirm(true);
  }, []);

  const handleConfirm = useCallback(() => {
    setShowConfirm(false);
    pendingActionRef.current?.();
    pendingActionRef.current = null;
    setIsDirty(false);
  }, []);

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
    pendingActionRef.current = null;
  }, []);

  const withGuard = useCallback((action: () => void) => {
    if (isDirty) {
      requestConfirm(action);
    } else {
      action();
    }
  }, [isDirty, requestConfirm]);

  return {
    isDirty,
    setIsDirty,
    markClean,
    markDirty,
    showConfirm,
    requestConfirm,
    handleConfirm,
    handleCancel,
    withGuard,
  };
}
