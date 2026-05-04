import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const icons = {
  success: <CheckCircle size={16} />,
  error: <AlertCircle size={16} />,
  info: <Info size={16} />,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type} ${t.leaving ? 'leaving' : ''}`}>
          <div className="toast-icon">{icons[t.type] || icons.info}</div>
          <div style={{ flex: 1 }}>
            <div className="toast-title">{t.title}</div>
            {t.message && <div className="toast-msg">{t.message}</div>}
          </div>
          <button onClick={() => removeToast(t.id)} style={{ color: 'var(--ink-faint)', marginLeft: 8, flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
