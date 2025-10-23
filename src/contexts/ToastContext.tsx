import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Toast as ToastType } from '../components/Toast';

interface ToastContextType {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts] = useState<ToastType[]>([]);

  const addToast = useCallback((_toast: Omit<ToastType, 'id'>) => {
    // Toast notifications are disabled - do nothing
    // const id = Math.random().toString(36).substr(2, 9);
    // const newToast: ToastType = {
    //   ...toast,
    //   id,
    //   duration: toast.duration || 5000
    // };
    
    // setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((_id: string) => {
    // Toast notifications are disabled - do nothing
    // setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    // Toast notifications are disabled - do nothing
    // setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      
      {/* Toast Container - Disabled */}
      {/* <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map(toast => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div> */}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience functions for common toast types
export const useToastHelpers = () => {
  const { addToast } = useToast();

  const showSuccess = useCallback((title: string, message: string, action?: ToastType['action']) => {
    addToast({ type: 'success', title, message, action });
  }, [addToast]);

  const showError = useCallback((title: string, message: string, action?: ToastType['action']) => {
    addToast({ type: 'error', title, message, action });
  }, [addToast]);

  const showWarning = useCallback((title: string, message: string, action?: ToastType['action']) => {
    addToast({ type: 'warning', title, message, action });
  }, [addToast]);

  const showInfo = useCallback((title: string, message: string, action?: ToastType['action']) => {
    addToast({ type: 'info', title, message, action });
  }, [addToast]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
