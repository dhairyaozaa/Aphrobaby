import { createPortal } from 'react-dom';
import { useStore } from '../state/Store';
import { CloseIcon } from './Icons';

export function Toasts() {
  const { toasts, dismissToast } = useStore();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast${toast.tone === 'error' ? ' toast--error' : ''}`} role="status">
          <span className="toast__mark" aria-hidden="true" />
          <p>{toast.text}</p>
          <button type="button" className="toast__close" onClick={() => dismissToast(toast.id)} aria-label="Dismiss message">
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
