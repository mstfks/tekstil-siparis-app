import React, { useEffect, useState } from 'react';
import { useUI } from '../context/UIContext';

const ConfirmModal: React.FC = () => {
  const { confirmModalData, hideConfirmModal } = useUI();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (confirmModalData) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [confirmModalData]);

  if (!confirmModalData) {
    return null;
  }

  const handleConfirm = () => {
    confirmModalData.onConfirm();
    hideConfirmModal();
  };

  const handleCancel = () => {
    if (confirmModalData.onCancel) {
      confirmModalData.onCancel();
    }
    hideConfirmModal();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const getModalIcon = () => {
    switch (confirmModalData.type) {
      case 'danger':
        return '🗑️';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return '❓';
    }
  };

  const getModalClass = () => {
    switch (confirmModalData.type) {
      case 'danger':
        return 'confirm-modal-danger';
      case 'warning':
        return 'confirm-modal-warning';
      case 'info':
      default:
        return 'confirm-modal-info';
    }
  };

  return (
    <div 
      className={`confirm-modal-overlay ${isVisible ? 'confirm-modal-visible' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`confirm-modal-content ${getModalClass()}`}>
        <div className="confirm-modal-header">
          <div className="confirm-modal-icon">
            {getModalIcon()}
          </div>
          <h2 className="confirm-modal-title">{confirmModalData.title}</h2>
        </div>
        
        <div className="confirm-modal-body">
          <p className="confirm-modal-message">{confirmModalData.message}</p>
        </div>
        
        <div className="confirm-modal-actions">
          <button 
            className="confirm-modal-cancel"
            onClick={handleCancel}
          >
            {confirmModalData.cancelText || 'İptal'}
          </button>
          <button 
            className={`confirm-modal-confirm ${confirmModalData.type === 'danger' ? 'danger' : ''}`}
            onClick={handleConfirm}
          >
            {confirmModalData.confirmText || 'Onayla'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 