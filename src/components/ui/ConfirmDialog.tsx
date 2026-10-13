import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Card';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  requireDoubleConfirm?: boolean;
  secondMessage?: string;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel, cancelLabel, danger = true, requireDoubleConfirm = false, secondMessage,
}: ConfirmDialogProps) {
  const { t } = useApp();
  const [step, setStep] = useState(1);

  const handleConfirm = () => {
    if (requireDoubleConfirm && step === 1) {
      setStep(2);
      return;
    }
    onConfirm();
    setStep(1);
    onClose();
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {danger && (
            <div className={`mt-0.5 flex-shrink-0 rounded-lg p-2 ${danger ? 'bg-red-50 dark:bg-red-900/30' : ''}`}>
              <AlertTriangle size={20} className="text-red-500" />
            </div>
          )}
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {step === 2 && secondMessage ? secondMessage : message}
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose}>
            {cancelLabel || t('common.cancel')}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={handleConfirm}
          >
            {step === 2 ? (confirmLabel || t('settings.confirm')) : t('settings.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
