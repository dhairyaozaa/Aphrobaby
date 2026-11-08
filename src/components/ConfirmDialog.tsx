import { useStore } from '../state/Store';
import { Modal } from './Modal';

export function ConfirmDialog() {
  const { confirmState, settleConfirm } = useStore();

  return (
    <Modal
      open={Boolean(confirmState)}
      onClose={() => settleConfirm(false)}
      title={confirmState?.title ?? 'Are you sure?'}
      eyebrow="A gentle check"
    >
      <p className="confirm__message">{confirmState?.message}</p>
      <div className="confirm__actions">
        <button type="button" className="btn btn--ghost" onClick={() => settleConfirm(false)}>
          {confirmState?.cancelLabel ?? 'Keep it'}
        </button>
        <button
          type="button"
          className={`btn ${confirmState?.danger === false ? 'btn--primary' : 'btn--danger'}`}
          data-autofocus
          onClick={() => settleConfirm(true)}
        >
          {confirmState?.confirmLabel ?? 'Remove'}
        </button>
      </div>
    </Modal>
  );
}
