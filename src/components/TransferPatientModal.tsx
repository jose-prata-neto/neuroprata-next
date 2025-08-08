import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import type { User } from "@/interfaces";

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
  const [selectedId, setSelectedId] = useState("");

  const availablePsychologists = psychologists.filter(
    (p) => p.id !== currentPsychologistId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      alert("Por favor, selecione um psicólogo.");
      return;
    }
    onTransfer(selectedId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transferir Paciente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="psychologist-select"
            className="block text-sm font-medium text-slate-700"
          >
            Selecione o novo psicólogo responsável
          </label>
          <select
            id="psychologist-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            required
          >
            <option value="" disabled>
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Confirmar Transferência</Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransferPatientModal;
