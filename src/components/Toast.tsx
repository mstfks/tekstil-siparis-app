import React, { useEffect, useState } from 'react';
import { useUI } from '../context/UIContext';

const Toast: React.FC = () => {
  const { toasts, hideToast } = useUI();

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getToastClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      case 'info':
      default:
        return 'toast-info';
    }
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => hideToast(toast.id)}
          getIcon={getToastIcon}
          getClass={getToastClass}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: {
    id: string;
    message: string;
    type: string;
    duration?: number;
  };
  onClose: () => void;
  getIcon: (type: string) => string;
  getClass: (type: string) => string;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose, getIcon, getClass }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Toast'ı görünür yap (animasyon için)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Animasyon süresi
  };

  return (
    <div 
      className={`toast-item ${getClass(toast.type)} ${isVisible ? 'toast-visible' : ''} ${isExiting ? 'toast-exiting' : ''}`}
    >
      <div className="toast-content">
        <span className="toast-icon">{getIcon(toast.type)}</span>
        <span className="toast-message">{toast.message}</span>
        <button 
          className="toast-close" 
          onClick={handleClose}
          aria-label="Bildirimi kapat"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast; 