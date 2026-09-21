import React from 'react';
import { Info, CheckCircle, AlertTriangle, X } from 'lucide-react';

const icons = {
  info:    <Info size={15} color="var(--accent)" />,
  success: <CheckCircle size={15} color="var(--success)" />,
  warning: <AlertTriangle size={15} color="var(--warning)" />,
  danger:  <X size={15} color="var(--danger)" />,
};

export default function ToastNotification({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item ${t.type || 'info'}`}>
          {icons[t.type] || icons.info}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
