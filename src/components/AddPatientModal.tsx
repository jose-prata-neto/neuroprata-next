import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import type { Patient } from '@/types';
import { useUploadThing } from '@/lib/uploadthing'; // Importa o nosso novo hook
import Image from 'next/image';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Omit<Patient, 'id' | 'createdAt' | 'sessions' | 'documents'>) => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [consent, setConsent] = useState(false);
  const [paymentType, setPaymentType] = useState<'particular' | 'plano'>('particular');
  const [healthPlan, setHealthPlan] = useState('');
  
  // Novos estados para controlar o ficheiro e o upload
  const [photoFile, setPhotoFile] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Hook do UploadThing
  const { startUpload } = useUploadThing("imageUploader");

  const resetForm = () => {
    setName('');
    setCpf('');
    setEmail('');
    setPhone('');
    setBirthDate('');
    setMedicalHistory('');
    setConsent(false);
    setPhotoFile([]);
    setPhotoPreview(undefined);
    setPaymentType('particular');
    setHealthPlan('');
  };
  
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        resetForm();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Função para lidar com a seleção do ficheiro
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile([file]);
      setPhotoPreview(URL.createObjectURL(file)); // Cria um preview local instantâneo
    }
  };
  
  // Função de submissão do formulário refatorada
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate || !cpf) {
        alert("Nome, CPF e Data de Nascimento são obrigatórios.");
        return;
    }
    setIsSaving(true);

    let uploadedPhotoUrl: string | undefined = undefined;

    // 1. Se houver uma foto, faz o upload primeiro
    if (photoFile.length > 0 && startUpload) {
      const uploadResult = await startUpload(photoFile);
      if (uploadResult && uploadResult[0]) {
        uploadedPhotoUrl = uploadResult[0].url;
      } else {
        alert("Ocorreu um erro ao fazer o upload da foto.");
        setIsSaving(false);
        return;
      }
    }

    // 2. Com o URL da foto (ou sem foto), chama a função onSave
    onSave({ 
        name, cpf, email, phone, birthDate, medicalHistory, consent, 
        photoUrl: uploadedPhotoUrl,
        paymentType,
        healthPlan: paymentType === 'plano' ? healthPlan : undefined,
    });
    
    setIsSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Paciente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Foto do Paciente</label>
          <div className="mt-1 flex items-center space-x-4">
            <span className="relative inline-block h-12 w-12 rounded-full overflow-hidden bg-slate-100">
              {photoPreview ? (
                <Image src={photoPreview} alt="Preview" fill className="object-cover" />
              ) : (
                <svg className="h-full w-full text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.997A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </span>
            {/* Mantemos o nosso input, que agora é controlado pela nossa lógica */}
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
            />
          </div>
        </div>
        
        {/* O resto do formulário continua exatamente igual */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome Completo *</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-slate-700">CPF *</label>
              <input type="text" id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm" />
            </div>
             <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Telefone</label>
              <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm" />
            </div>
             <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700">Data de Nascimento *</label>
              <input type="date" id="birthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm" required />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Tipo de Pagamento *</label>
                <div className="mt-1 flex items-center space-x-6 rounded-md border border-slate-300 p-2 bg-white">
                    <div className="flex items-center">
                        <input id="particular" name="paymentType" type="radio" value="particular" checked={paymentType === 'particular'} onChange={() => setPaymentType('particular')} className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300"/>
                        <label htmlFor="particular" className="ml-2 block text-sm font-medium text-slate-700">Particular</label>
                    </div>
                    <div className="flex items-center">
                        <input id="plano" name="paymentType" type="radio" value="plano" checked={paymentType === 'plano'} onChange={() => setPaymentType('plano')} className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300"/>
                        <label htmlFor="plano" className="ml-2 block text-sm font-medium text-slate-700">Plano de Saúde</label>
                    </div>
                </div>
            </div>
            {paymentType === 'plano' && (
              <div className="sm:col-span-2">
                <label htmlFor="healthPlan" className="block text-sm font-medium text-slate-700">Nome do Plano de Saúde *</label>
                <input type="text" id="healthPlan" value={healthPlan} onChange={(e) => setHealthPlan(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm" required />
              </div>
            )}
        </div>
        <div>
          <label htmlFor="medicalHistory" className="block text-sm font-medium text-slate-700">Histórico Médico</label>
           <textarea id="medicalHistory" value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm" placeholder="Resumo do histórico médico, alergias, medicamentos..." />
        </div>
        <div className="flex items-start">
            <div className="flex h-5 items-center">
                <input id="consent" name="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500" />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="consent" className="font-medium text-slate-700">Consentimento Digital</label>
                <p className="text-slate-500">O paciente forneceu consentimento digital para o tratamento.</p>
            </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving}>{isSaving ? 'Salvando...' : 'Salvar Paciente'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPatientModal;
