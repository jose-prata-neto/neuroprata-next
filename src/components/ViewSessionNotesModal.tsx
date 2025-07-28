
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import type { Session } from '@/types';
import { formatDateTime } from '@/utils/formatters';

interface ViewSessionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
}

const ViewSessionNotesModal: React.FC<ViewSessionNotesModalProps> = ({ isOpen, onClose, session }) => {
  if (!session) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Anotações da Sessão">
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="font-semibold text-slate-700">{formatDateTime(session.date)}</p>
            <p className="text-sm text-slate-500">{session.duration} min - {session.sessionType}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Anotações Completas</label>
          <div className="h-64 overflow-y-auto rounded-md border border-slate-300 bg-slate-50 p-3 whitespace-pre-wrap text-slate-700">
            {session.notes}
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="button" onClick={onClose} variant="secondary">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewSessionNotesModal;
