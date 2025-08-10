import type React from 'react';
import Button from './Button';
import Modal from './Modal';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-slate-600">{message}</p>
        <div className="flex justify-end space-x-3 pt-4">
          <Button onClick={onClose} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button onClick={onConfirm} type="button" variant="danger">
            Sim, desejo excluir
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
