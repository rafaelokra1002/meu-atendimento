'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type === 'success' ? 'toast-success' : 'toast-error'} ${exiting ? 'animate-slide-out' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">
          {type === 'success' ? '✅' : '❌'}
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
}
