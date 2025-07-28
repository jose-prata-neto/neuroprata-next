
import React, { useState, useMemo, useEffect } from 'react';
import type { Patient, User } from '@/types';
import { PlusIcon, UserGroupIcon, ShieldCheckIcon } from '@/constants';
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

const PatientList: React.FC<PatientListProps> = ({ patients, currentUser, selectedPatientId, onSelectPatient, onAddPatient, onShowStaffManagement, onShowAdminDashboard }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPatients = useMemo(() => patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpf.includes(searchTerm)
  ), [patients, searchTerm]);

  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
  const paginatedPatients = useMemo(() => 
    filteredPatients.slice((currentPage - 1) * PATIENTS_PER_PAGE, currentPage * PATIENTS_PER_PAGE),
    [filteredPatients, currentPage]
  );

  return (
    <div className="flex h-full flex-col bg-white shadow-md">
      <div className="border-b p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">
            {currentUser.role === 'admin' ? 'Todos os Pacientes' : 'Pacientes'}
            </h2>
          <div>
            {currentUser.role === 'psychologist' && (
              <Button variant="ghost" size="sm" onClick={onShowStaffManagement} title="Gerenciar Equipe">
                  <UserGroupIcon />
              </Button>
            )}
             {currentUser.role === 'admin' && (
              <Button variant="ghost" size="sm" onClick={onShowAdminDashboard} title="Painel Admin">
                  <ShieldCheckIcon />
              </Button>
            )}
          </div>
        </div>
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-2 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {paginatedPatients.length > 0 ? (
          <ul>
            {paginatedPatients.map((patient) => (
              <li key={patient.id}>
                <button
                  onClick={() => onSelectPatient(patient.id)}
                  className={`w-full border-b px-4 py-3 text-left transition-colors ${
                    selectedPatientId === patient.id
                      ? 'bg-slate-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <p className="font-semibold text-slate-800">{patient.name}</p>
                  <p className="text-sm text-slate-500">{patient.cpf || 'Sem CPF'}</p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-slate-500">
            <p>{searchTerm ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado.'}</p>
          </div>
        )}
      </div>
      <div className="border-t p-4">
        {totalPages > 1 && (
            <div className="mb-4 flex items-center justify-between">
                <Button variant="secondary" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                    Anterior
                </Button>
                <span className="text-sm text-slate-500">
                    Página {currentPage} de {totalPages}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                    Próximo
                </Button>
            </div>
        )}
        <Button
          onClick={onAddPatient}
          disabled={currentUser.role === 'staff'}
          title={currentUser.role === 'staff' ? 'Apenas psicólogos podem adicionar pacientes.' : 'Adicionar novo paciente'}
          className="w-full"
        >
          <PlusIcon />
          <span className="ml-2">Novo Paciente</span>
        </Button>
      </div>
    </div>
  );
};

export default PatientList;
