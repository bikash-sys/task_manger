import React, { ReactNode } from 'react';
import Modal from './Modal';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-on-surface-secondary mb-6">
        {children}
      </div>
      <div className="flex justify-end space-x-3">
        <button 
          onClick={onClose} 
          className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm} 
          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
