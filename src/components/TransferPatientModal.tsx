import type React from 'react';
import { useState } from 'react';
import type { User } from '@/interfaces';
import Button from './Button';
import Modal from './Modal';

interface TransferPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (newPsychologistId: string) => void;
  psychologists: User[];
  currentPsychologistId?: string;
}

const TransferPatientModal: React.FC<TransferPatientModalProps> = ({
  isOpen,
  onClose,
  onTransfer,
  psychologists,
  currentPsychologistId,
}) => {
  const [selectedId, setSelectedId] = useState('');

  const availablePsychologists = psychologists.filter(
    (p) => p.id !== currentPsychologistId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      alert('Por favor, selecione um psicólogo.');
      return;
    }
    onTransfer(selectedId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transferir Paciente">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="block font-medium text-slate-700 text-sm"
            htmlFor="psychologist-select"
          >
            Selecione o novo psicólogo responsável
          </label>
          <select
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            id="psychologist-select"
            onChange={(e) => setSelectedId(e.target.value)}
            required
            value={selectedId}
          >
            <option disabled value="">
              Selecione um profissional...
            </option>
            {availablePsychologists.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.crp})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button onClick={onClose} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button type="submit">Confirmar Transferência</Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransferPatientModal;
