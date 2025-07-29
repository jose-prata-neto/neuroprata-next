import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import type { Document } from '@/types';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: Omit<Document, 'id' | 'uploadedAt' | 'url'>, file: File) => void;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'pdf' | 'image' | 'report'>('report');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setName('');
        setType('report');
        setFile(null);
        setError(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const validate = () => {
    if (!name.trim() || !file) {
      setError("Nome do documento e arquivo são obrigatórios.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && file) {
      onSave({ name, type }, file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (selectedFile) {
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setError(`O arquivo excede o limite de ${MAX_FILE_SIZE_MB}MB.`);
            setFile(null);
            e.target.value = '';
            return;
        }

        setFile(selectedFile);
        if (!name) {
            setName(selectedFile.name.split('.').slice(0, -1).join('.'));
        }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Documento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="doc-name" className="block text-sm font-medium text-slate-700">Nome do Documento *</label>
          <input
            type="text"
            id="doc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${error && !name.trim() ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'}`}
            required
          />
        </div>
        <div>
          <label htmlFor="doc-type" className="block text-sm font-medium text-slate-700">Tipo de Documento</label>
          <select 
            id="doc-type" 
            value={type} 
            onChange={e => setType(e.target.value as 'pdf' | 'image' | 'report')} 
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
          >
            <option value="report">Relatório</option>
            <option value="image">Imagem</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        <div>
            <label htmlFor="doc-file" className="block text-sm font-medium text-slate-700">Arquivo *</label>
             <input
              type="file"
              id="doc-file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
              required
            />
            {file && !error && <p className="mt-2 text-xs text-slate-500">Arquivo selecionado: {file.name} ({ (file.size / 1024 / 1024).toFixed(2) } MB)</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Adicionar Documento</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDocumentModal;