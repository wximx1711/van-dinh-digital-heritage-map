import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel, cancelLabel }: ConfirmDialogProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 700 }}
      onClick={onCancel}>
      <div style={{ background: 'white', borderRadius: 12, padding: '28px', maxWidth: 360, width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEF9E7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#D4A017' }}>
          <AlertTriangle size={24} />
        </div>
        <h3 style={{ color: '#0F3D5E', fontSize: 16, marginBottom: 8 }}>{confirmLabel || 'Confirm'}</h3>
        <p style={{ color: '#5d7a8c', fontSize: 13, marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onCancel}
            style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(15,61,94,0.2)', background: 'white', color: '#5d7a8c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {cancelLabel || 'Cancel'}
          </button>
          <button onClick={onConfirm}
            style={{ padding: '9px 20px', borderRadius: 8, background: '#E74C3C', border: 'none', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(231,76,60,0.3)' }}>
            {confirmLabel || 'Discard'}
          </button>
        </div>
      </div>
    </div>
  );
}
