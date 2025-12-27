import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';

export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  className?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  className = ""
}) => {
  const { t } = useTranslation(['commissions', 'common']);
  const defaultTitle = title || t('commissions:modals.error.title');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-[#2a2a2a] rounded-xl p-6 mx-4 max-w-md w-full border border-gray-600 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">
            {defaultTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-300 text-center">
            {message}
          </p>
        </div>
        
        {/* Footer */}
        <div className="flex justify-center">
          <Button
            onClick={onClose}
            variant="yellow"
            size="md"
            className="rounded-xl font-semibold"
          >
            {t('commissions:modals.error.understood')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
