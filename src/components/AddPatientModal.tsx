import Image from 'next/image';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useUploadThing } from '@/lib/uploadthing';
import type { Patient } from '@/server/db/schema';
import Button from './Button';
import Modal from './Modal';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    patient: Omit<Patient, 'id' | 'createdAt' | 'sessions' | 'documents'>
  ) => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [consent, setConsent] = useState(false);
  const [paymentType, setPaymentType] = useState<'particular' | 'plano'>(
    'particular'
  );
  const [healthPlan, setHealthPlan] = useState('');

  // Novos estados para controlar o ficheiro e o upload
  const [photoFile, setPhotoFile] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(
    undefined
  );
  const [isSaving, setIsSaving] = useState(false);

  // Hook do UploadThing
  const { startUpload } = useUploadThing('imageUploader');

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
    if (!(name && birthDate && cpf)) {
      alert('Nome, CPF e Data de Nascimento são obrigatórios.');
      return;
    }
    setIsSaving(true);

    let uploadedPhotoUrl: string | undefined;

    // 1. Se houver uma foto, faz o upload primeiro
    if (photoFile.length > 0 && startUpload) {
      const uploadResult = await startUpload(photoFile);
      if (uploadResult && uploadResult[0]) {
        uploadedPhotoUrl = uploadResult[0].url;
      } else {
        alert('Ocorreu um erro ao fazer o upload da foto.');
        setIsSaving(false);
        return;
      }
    }

    // 2. Com o URL da foto (ou sem foto), chama a função onSave
    onSave({
      name,
      cpf,
      email,
      phone,
      birthDate,
      medicalHistory,
      consent,
      photoUrl: uploadedPhotoUrl,
      paymentType,
      healthPlan: paymentType === 'plano' ? healthPlan : undefined,
    });

    setIsSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Novo Paciente">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block font-medium text-slate-700 text-sm">
            Foto do Paciente
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <span className="relative inline-block h-12 w-12 overflow-hidden rounded-full bg-slate-100">
              {photoPreview ? (
                <Image
                  alt="Preview"
                  className="object-cover"
                  fill
                  src={photoPreview}
                />
              ) : (
                <svg
                  className="h-full w-full text-slate-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.997A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </span>
            {/* Mantemos o nosso input, que agora é controlado pela nossa lógica */}
            <input
              accept="image/*"
              className="block w-full text-slate-500 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-slate-50 file:px-4 file:py-2 file:font-semibold file:text-slate-700 file:text-sm hover:file:bg-slate-100"
              id="photo"
              onChange={handlePhotoChange}
              type="file"
            />
          </div>
        </div>

        {/* O resto do formulário continua exatamente igual */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              className="block font-medium text-slate-700 text-sm"
              htmlFor="name"
            >
              Nome Completo *
            </label>
            <input
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
              id="name"
              onChange={(e) => setName(e.target.value)}
              required
              type="text"
              value={name}
            />
          </div>
          <div>
            <label
              className="block font-medium text-slate-700 text-sm"
              htmlFor="cpf"
            >
              CPF *
            </label>
            <input
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
              id="cpf"
              onChange={(e) => setCpf(e.target.value)}
              required
              type="text"
              value={cpf}
            />
          </div>
          <div>
            <label
              className="block font-medium text-slate-700 text-sm"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              value={email}
            />
          </div>
          <div>
            <label
              className="block font-medium text-slate-700 text-sm"
              htmlFor="phone"
            >
              Telefone
            </label>
            <input
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
              id="phone"
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              value={phone}
            />
          </div>
          <div>
            <label
              className="block font-medium text-slate-700 text-sm"
              htmlFor="birthDate"
            >
              Data de Nascimento *
            </label>
            <input
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
              id="birthDate"
              onChange={(e) => setBirthDate(e.target.value)}
              required
              type="date"
              value={birthDate}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-700 text-sm">
              Tipo de Pagamento *
            </label>
            <div className="mt-1 flex items-center space-x-6 rounded-md border border-slate-300 bg-white p-2">
              <div className="flex items-center">
                <input
                  checked={paymentType === 'particular'}
                  className="h-4 w-4 border-slate-300 text-slate-600 focus:ring-slate-500"
                  id="particular"
                  name="paymentType"
                  onChange={() => setPaymentType('particular')}
                  type="radio"
                  value="particular"
                />
                <label
                  className="ml-2 block font-medium text-slate-700 text-sm"
                  htmlFor="particular"
                >
                  Particular
                </label>
              </div>
              <div className="flex items-center">
                <input
                  checked={paymentType === 'plano'}
                  className="h-4 w-4 border-slate-300 text-slate-600 focus:ring-slate-500"
                  id="plano"
                  name="paymentType"
                  onChange={() => setPaymentType('plano')}
                  type="radio"
                  value="plano"
                />
                <label
                  className="ml-2 block font-medium text-slate-700 text-sm"
                  htmlFor="plano"
                >
                  Plano de Saúde
                </label>
              </div>
            </div>
          </div>
          {paymentType === 'plano' && (
            <div className="sm:col-span-2">
              <label
                className="block font-medium text-slate-700 text-sm"
                htmlFor="healthPlan"
              >
                Nome do Plano de Saúde *
              </label>
              <input
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
                id="healthPlan"
                onChange={(e) => setHealthPlan(e.target.value)}
                required
                type="text"
                value={healthPlan}
              />
            </div>
          )}
        </div>
        <div>
          <label
            className="block font-medium text-slate-700 text-sm"
            htmlFor="medicalHistory"
          >
            Histórico Médico
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            id="medicalHistory"
            onChange={(e) => setMedicalHistory(e.target.value)}
            placeholder="Resumo do histórico médico, alergias, medicamentos..."
            rows={3}
            value={medicalHistory}
          />
        </div>
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              checked={consent}
              className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
              id="consent"
              name="consent"
              onChange={(e) => setConsent(e.target.checked)}
              type="checkbox"
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="font-medium text-slate-700" htmlFor="consent">
              Consentimento Digital
            </label>
            <p className="text-slate-500">
              O paciente forneceu consentimento digital para o tratamento.
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button onClick={onClose} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button isLoading={isSaving} type="submit">
            {isSaving ? 'Salvando...' : 'Salvar Paciente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPatientModal;
