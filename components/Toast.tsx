import React from 'react';

interface ToastProps {
  message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <div
      className="bg-surface text-on-surface py-2 px-4 rounded-lg shadow-lg animate-fade-in-up w-full max-w-xs text-center"
      role="alert"
    >
      {message}
    </div>
  );
};

export default Toast;
