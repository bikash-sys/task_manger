import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Toast from '../components/Toast';

interface ToastMessage {
  id: number;
  message: string;
}

interface ToastContextType {
  addToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(currentToasts => [...currentToasts, { id, message }]);
    setTimeout(() => {
      setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-24 right-8 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
