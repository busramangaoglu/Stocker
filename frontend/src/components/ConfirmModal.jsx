import React, { useEffect } from 'react';

/**
 * Tarayıcı confirm() yerine uygulama temasına uygun onay.
 */
export default function ConfirmModal({
  open,
  title = 'Onay',
  children,
  cancelLabel = 'İptal',
  confirmLabel = 'Tamam',
  onCancel,
  onConfirm,
  danger = false,
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onCancel?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="modalOverlay modalOverlay--confirm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div
        className="modal modal--confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modalHeader modalHeader--confirm">
          <div className="modalTitle" id="confirm-modal-title">
            {title}
          </div>
          <button type="button" className="confirmModalClose" onClick={() => onCancel?.()} aria-label="Kapat">
            ×
          </button>
        </div>
        <div className="modalBody modalBody--confirm" id="confirm-modal-desc">
          {children}
        </div>
        <div className="modalFooter modalFooter--confirm">
          <button type="button" className="btn btnGhost" onClick={() => onCancel?.()}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? 'btn btnDanger' : 'btn btnPrimary'}
            onClick={() => onConfirm?.()}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
