import React, { useEffect } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          container: 'bg-green-500/90 border-green-400',
          icon: '✅',
          iconBg: 'bg-green-400'
        };
      case 'error':
        return {
          container: 'bg-red-500/90 border-red-400',
          icon: '❌',
          iconBg: 'bg-red-400'
        };
      case 'warning':
        return {
          container: 'bg-yellow-500/90 border-yellow-400',
          icon: '⚠️',
          iconBg: 'bg-yellow-400'
        };
      case 'info':
        return {
          container: 'bg-blue-500/90 border-blue-400',
          icon: 'ℹ️',
          iconBg: 'bg-blue-400'
        };
      default:
        return {
          container: 'bg-gray-500/90 border-gray-400',
          icon: '📢',
          iconBg: 'bg-gray-400'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className={`${styles.container} backdrop-blur-sm border rounded-lg p-4 shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105`}>
      <div className="flex items-start space-x-3">
        <div className={`${styles.iconBg} rounded-full p-1 flex-shrink-0`}>
          <span className="text-white text-sm">{styles.icon}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm mb-1">
            {toast.title}
          </h4>
          <p className="text-white/90 text-sm leading-relaxed">
            {toast.message}
          </p>
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-white/80 hover:text-white text-xs underline transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={() => onRemove(toast.id)}
          className="text-white/70 hover:text-white transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
