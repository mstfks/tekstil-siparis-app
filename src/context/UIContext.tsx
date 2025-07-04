import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ConfirmModalData {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface UIContextType {
  // Toast yönetimi
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  hideToast: (id: string) => void;
  toasts: ToastMessage[];
  
  // Modal yönetimi
  showConfirmModal: (data: ConfirmModalData) => void;
  hideConfirmModal: () => void;
  confirmModalData: ConfirmModalData | null;
  
  // Sidebar yönetimi
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmModalData, setConfirmModalData] = useState<ConfirmModalData | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sayfa yüklendiğinde localStorage'dan sidebar durumunu oku
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setIsCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  // Sidebar durumu değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    // Otomatik olarak toast'ı kaldır
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showConfirmModal = (data: ConfirmModalData) => {
    setConfirmModalData(data);
  };

  const hideConfirmModal = () => {
    setConfirmModalData(null);
  };

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const value: UIContextType = {
    showToast,
    hideToast,
    toasts,
    showConfirmModal,
    hideConfirmModal,
    confirmModalData,
    isCollapsed,
    setIsCollapsed,
    toggleSidebar,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}; 