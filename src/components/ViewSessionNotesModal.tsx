import type React from 'react';
import type { Session } from '@/interfaces';
import { formatDateTime } from '@/utils/formatters';
import Button from './Button';
import Modal from './Modal';

interface ViewSessionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
}

const ViewSessionNotesModal: React.FC<ViewSessionNotesModalProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  if (!session) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Anotações da Sessão">
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-700">
            {formatDateTime(session.date)}
          </p>
          <p className="text-slate-500 text-sm">
            {session.duration} min - {session.sessionType}
          </p>
        </div>
        <div>
          <label className="mb-1 block font-medium text-slate-700 text-sm">
            Anotações Completas
          </label>
          <div className="h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-slate-300 bg-slate-50 p-3 text-slate-700">
            {session.notes}
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} type="button" variant="secondary">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewSessionNotesModal;
