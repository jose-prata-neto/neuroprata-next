import { Plus, ShieldCheck, Users } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { Patient, User } from '@/server/db/schema';
import Button from './Button';

interface PatientListProps {
  patients: Patient[];
  currentUser: User;
  selectedPatientId: string | null;
  onSelectPatient: (id: string) => void;
  onAddPatient: () => void;
  onShowStaffManagement: () => void;
  onShowAdminDashboard: () => void;
}

const PATIENTS_PER_PAGE = 15;

const PatientList: React.FC<PatientListProps> = ({
  patients,
  currentUser,
  selectedPatientId,
  onSelectPatient,
  onAddPatient,
  onShowStaffManagement,
  onShowAdminDashboard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPatients = useMemo(
    () =>
      patients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.cpf.includes(searchTerm)
      ),
    [patients, searchTerm]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
  const paginatedPatients = useMemo(
    () =>
      filteredPatients.slice(
        (currentPage - 1) * PATIENTS_PER_PAGE,
        currentPage * PATIENTS_PER_PAGE
      ),
    [filteredPatients, currentPage]
  );

  return (
    <div className="flex h-full flex-col bg-white shadow-md">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-800">
            {currentUser.role === 'admin' ? 'Todos os Pacientes' : 'Pacientes'}
          </h2>
          <div>
            {currentUser.role === 'psychologist' && (
              <Button
                onClick={onShowStaffManagement}
                size="sm"
                title="Gerenciar Equipe"
                variant="ghost"
              >
                <Users />
              </Button>
            )}
            {currentUser.role === 'admin' && (
              <Button
                onClick={onShowAdminDashboard}
                size="sm"
                title="Painel Admin"
                variant="ghost"
              >
                <ShieldCheck />
              </Button>
            )}
          </div>
        </div>
        <input
          className="mt-2 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome ou CPF..."
          type="text"
          value={searchTerm}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {paginatedPatients.length > 0 ? (
          <ul>
            {paginatedPatients.map((patient) => (
              <li key={patient.id}>
                <button
                  className={`w-full border-b px-4 py-3 text-left transition-colors ${
                    selectedPatientId === patient.id
                      ? 'bg-slate-200'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => onSelectPatient(patient.id)}
                >
                  <p className="font-semibold text-slate-800">{patient.name}</p>
                  <p className="text-slate-500 text-sm">
                    {patient.cpf || 'Sem CPF'}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-slate-500">
            <p>
              {searchTerm
                ? 'Nenhum paciente encontrado.'
                : 'Nenhum paciente cadastrado.'}
            </p>
          </div>
        )}
      </div>
      <div className="border-t p-4">
        {totalPages > 1 && (
          <div className="mb-4 flex items-center justify-between">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              size="sm"
              variant="secondary"
            >
              Anterior
            </Button>
            <span className="text-slate-500 text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              size="sm"
              variant="secondary"
            >
              Próximo
            </Button>
          </div>
        )}
        <Button
          className="w-full"
          disabled={currentUser.role === 'staff'}
          onClick={onAddPatient}
          title={
            currentUser.role === 'staff'
              ? 'Apenas psicólogos podem adicionar pacientes.'
              : 'Adicionar novo paciente'
          }
        >
          <Plus />
          <span className="ml-2">Novo Paciente</span>
        </Button>
      </div>
    </div>
  );
};

export default PatientList;
