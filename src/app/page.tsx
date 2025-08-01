"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Patient, Session, Document, User, AuditLog, RegisterData } from '@/types';
import { getPatients, addPatient, addSession, deleteSession, updateSessionPaymentStatus } from '@/services/storageService';
import * as authService from '@/services/authService';
import * as auditLogService from '@/services/auditLogService';
import { fileToDataURL, getFileType } from '@/utils/formatters';

import Header from '@/components/Header';
import PatientList from '@/components/PatientList';
import PatientDetail from '@/components/PatientDetail';
import StaffManagement from '@/components/StaffManagement';
import { AdminDashboard } from '@/components/AdminDashboard';

import AddPatientModal from '@/components/AddPatientModal';
import { SessionEditorModal } from '@/components/AddEvolutionModal';
import AddDocumentModal from '@/components/AddDocumentModal';
import ViewSessionNotesModal from '@/components/ViewSessionNotesModal';
import ViewLogDetailsModal from '@/components/ViewLogDetailsModal';
import AuthPage from '@/components/AuthPage';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import TransferPatientModal from '@/components/TransferPatientModal';

export default function HomePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainView, setMainView] = useState<'patients' | 'staff' | 'admin'>('patients');

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const [modals, setModals] = useState({
    addPatient: false,
    addSession: false,
    addDocument: false,
    viewNotes: false,
    viewLogDetails: false,
    deleteConfirmation: false,
    transferPatient: false,
  });

  const [itemToDelete, setItemToDelete] = useState<{type: 'patient' | 'session', id: string} | null>(null);
  const [sessionToView, setSessionToView] = useState<Session | null>(null);
  const [sessionLogsToView, setSessionLogsToView] = useState<AuditLog[]>([]);

  const selectedPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  const deleteModalInfo = useMemo(() => {
    if (itemToDelete?.type === 'patient') {
      const patient = patients.find(p => p.id === itemToDelete.id);
      return { title: 'Excluir Paciente', message: `Você tem certeza que deseja excluir o paciente "${patient?.name}"? Esta ação é irreversível.`}
    }
    if (itemToDelete?.type === 'session') {
      return { title: 'Excluir Sessão', message: 'Você tem certeza que deseja excluir esta sessão? Esta ação é irreversível.'}
    }
    return { title: '', message: '' };
  }, [itemToDelete, patients]);

  const refreshData = useCallback(async () => {
    try {
      const patientsData = await getPatients();
      setPatients(patientsData);
      const usersData = await authService.getUsers();
      setUsers(usersData);
      const session = authService.getCurrentUser();
      if (session?.user?.role === 'admin') {
        setAuditLogs(auditLogService.getAllLogs());
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const session = authService.getCurrentUser();
        if (session) {
          setCurrentUser(session.user);
        }
        await refreshData();
      } catch (error) {
        console.error("Erro ao inicializar aplicação:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [refreshData]);

  const updateLogsState = useCallback((newLog: AuditLog | null) => {
    if (newLog && currentUser?.role === 'admin') {
      setAuditLogs(prevLogs => [newLog, ...prevLogs]);
    }
  }, [currentUser?.role]);

  const patientsForCurrentUser = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return patients;
    if (currentUser.role === 'psychologist') {
      return patients.filter(p => p.psychologistId === currentUser.id);
    }
    if (currentUser.role === 'staff') {
      const linkedPsychologistIds = currentUser.linkedUserIds || [];
      return patients.filter(p => p.psychologistId && linkedPsychologistIds.includes(p.psychologistId));
    }
    return [];
  }, [patients, currentUser]);

  const canPerformAction = useCallback((action: 'create' | 'delete' | 'transfer') => {
    if (!currentUser) return false;
    if (currentUser.role === 'staff') return false;
    if ((action === 'create' || action === 'delete' || action === 'transfer') && currentUser.role === 'admin') return true;
    return currentUser.role === 'psychologist';
  }, [currentUser]);

  useEffect(() => {
    if (mainView === 'patients' || (mainView === 'admin' && currentUser?.role === 'admin')) {
      if (patientsForCurrentUser.length > 0 && !patientsForCurrentUser.find(p => p.id === selectedPatientId)) {
        setSelectedPatientId(patientsForCurrentUser[0]?.id || null);
      } else if (patientsForCurrentUser.length === 0) {
        setSelectedPatientId(null);
      }
    }
  }, [patientsForCurrentUser, selectedPatientId, mainView, currentUser?.role, selectedPatient]);
  
  const updateAndSaveUsers = async (newUsers: User[]) => {
    try {
      setUsers(newUsers);
      await authService.saveUsers(newUsers);
    } catch (error) {
      console.error("Erro ao salvar usuários:", error);
      throw error;
    }
  };

  const handleSelectPatient = useCallback((id: string) => {
    setSelectedPatientId(id);
    setMainView('patients');
  }, []);
  
  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await authService.login(email, password);
      if (result.success && result.user) {
        setCurrentUser(result.user);
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, error: "Erro interno do servidor" };
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      const result = await authService.register(data);
      if (result.success) {
        await handleLogin(data.email, data.password);
      }
      return result;
    } catch (error) {
      console.error("Erro no registro:", error);
      return { success: false, error: "Erro interno do servidor" };
    }
  };

  const handleLogout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setSelectedPatientId(null);
    setMainView('patients');
    setAuditLogs([]);
  }, []);

  const handleAddPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'sessions' | 'documents'>) => {
    if (!canPerformAction('create') || !currentUser) return;
    try {
      const psychologistId = currentUser.role === 'psychologist' ? currentUser.id : undefined;
      await addPatient({ ...patientData, psychologistId });
      updateLogsState(auditLogService.logEvent('create_patient', { patientName: patientData.name }));
      setModals(prev => ({ ...prev, addPatient: false }));
      await refreshData();
    } catch (error) {
      console.error("Erro ao adicionar paciente:", error);
    }
  };

  // DEBBUGING: Adicionados console.log para seguir o fluxo
  const handleAddSession = async (sessionData: Omit<Session, 'id'>, files: File[]) => {
    console.log("1. handleAddSession foi chamada no page.tsx");
    if (!selectedPatientId) {
      console.error("SAÍDA: Nenhuma paciente selecionada (selectedPatientId está nulo).");
      return;
    }

    console.log("2. ID do Paciente Selecionado:", selectedPatientId);
    console.log("3. Dados da sessão a serem guardados:", sessionData);

    try {
      await addSession({
        ...sessionData,
        patientId: selectedPatientId,
      });

      console.log("6. SUCESSO: A função addSession terminou sem erros.");
      updateLogsState(auditLogService.logEvent('create_session', { patientId: selectedPatientId }));
      setModals(prev => ({ ...prev, addSession: false }));
      await refreshData();

    } catch (error) {
      console.error("!!! ERRO FINAL no page.tsx:", error);
    }
  };
  
  const handleAddDocument = async (documentData: Omit<Document, 'id' | 'uploadedAt' | 'url'>, file: File) => {
     // Lógica futura
  };

  const handleDeletePatient = useCallback((patientId: string) => {
     // Lógica futura
  }, []);

const handleDeleteSession = (sessionId: string) => {
  if (!canPerformAction('delete')) return;
  setItemToDelete({ type: 'session', id: sessionId });
  setModals(prev => ({ ...prev, deleteConfirmation: true }));
};

// Esta função EXECUTA a exclusão após a confirmação
const handleConfirmDelete = async () => {
  if (!itemToDelete) return;

  // Lógica para apagar Pacientes (mantemos como estava)
  if (itemToDelete.type === 'patient') {
    // ... a lógica de apagar paciente que já tínhamos fica aqui ...
  } 
  // Lógica NOVA para apagar Sessões
  else if (itemToDelete.type === 'session' && selectedPatientId) {
    try {
      // Chama a nossa nova API para apagar a sessão
      await deleteSession(itemToDelete.id);

      updateLogsState(auditLogService.logEvent('delete_session', { 
        patientId: selectedPatientId, 
        sessionId: itemToDelete.id 
      }));

      await refreshData(); // Busca os dados atualizados

    } catch (error) {
      console.error("Erro ao confirmar exclusão da sessão:", error);
    }
  }

  // Limpa o estado e fecha o modal
  setItemToDelete(null);
  setModals(prev => ({ ...prev, deleteConfirmation: false }));
};
  
  const handleTransferPatient = async (newPsychologistId: string) => {
    // Lógica futura
  };
  const handleUpdateSessionStatus = async (sessionId: string, status: 'paid' | 'pending') => {
    try {
      await updateSessionPaymentStatus(sessionId, status);
      await refreshData(); // Recarrega os dados para mostrar a alteração
    } catch (error) {
      console.error(`Erro ao atualizar estado da sessão para ${status}:`, error);
      // Opcional: Mostrar uma mensagem de erro ao utilizador
    }
  };
  
  const handleLinkStaff = async (staffEmail: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'psychologist') return { success: false, error: 'Ação não permitida.' };
    if(currentUser.linkedUserIds && currentUser.linkedUserIds.length > 0) return { success: false, error: 'Você já possui um funcionário vinculado.'}
    try {
      const allUsers = await authService.getUsers();
      const staffToLink = allUsers.find(u => u.email.toLowerCase() === staffEmail.toLowerCase());
      if (!staffToLink) return { success: false, error: 'Nenhum usuário encontrado com este e-mail.' };
      if (staffToLink.role !== 'staff') return { success: false, error: 'Esta conta não é de um funcionário.' };
      const updatedPsychologist = { ...currentUser, linkedUserIds: [staffToLink.id] };
      const updatedStaff = { ...staffToLink, linkedUserIds: [...(staffToLink.linkedUserIds || []), currentUser.id] };
      const updatedUsers = allUsers.map(u => {
          if (u.id === currentUser.id) return updatedPsychologist;
          if (u.id === staffToLink.id) return updatedStaff;
          return u;
      });
      await updateAndSaveUsers(updatedUsers);
      updateLogsState(auditLogService.logEvent('link_staff', { staffId: staffToLink.id, staffEmail: staffToLink.email }));
      setCurrentUser(updatedPsychologist);
      authService.saveCurrentUser(updatedPsychologist);
      await refreshData();
      return { success: true };
    } catch (error) {
      console.error("Erro ao vincular funcionário:", error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const handleUnlinkStaff = async (staffId: string) => {
    if (!currentUser || currentUser.role !== 'psychologist') return;
    try {
      const allUsers = await authService.getUsers();
      const staffToUnlink = allUsers.find(u => u.id === staffId);
      if (!staffToUnlink) return;
      const updatedPsychologist = { ...currentUser, linkedUserIds: [] };
      const updatedStaff = { ...staffToUnlink, linkedUserIds: (staffToUnlink.linkedUserIds || []).filter(id => id !== currentUser.id) };
      const updatedUsers = allUsers.map(u => {
          if (u.id === currentUser.id) return updatedPsychologist;
          if (u.id === staffToUnlink.id) return updatedStaff;
          return u;
      });
      await updateAndSaveUsers(updatedUsers);
      updateLogsState(auditLogService.logEvent('unlink_staff', { staffId: staffToUnlink.id, staffEmail: staffToUnlink.email }));
      setCurrentUser(updatedPsychologist);
      authService.saveCurrentUser(updatedPsychologist);
      await refreshData();
    } catch (error) {
      console.error("Erro ao desvincular funcionário:", error);
    }
  };

  const handleOpenViewNotesModal = (session: Session) => {
    if (selectedPatientId) {
      updateLogsState(auditLogService.logEvent('view_session_notes', { patientId: selectedPatientId, sessionId: session.id }));
    }
    setSessionToView(session);
    setModals(prev => ({ ...prev, viewNotes: true }));
  };
  
  const handleOpenViewSessionLogs = (logs: AuditLog[]) => {
    setSessionLogsToView(logs);
    setModals(prev => ({ ...prev, viewLogDetails: true }));
  }

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Carregando...</div>;
  }

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const renderMainView = () => {
    if (mainView === 'admin' && currentUser.role === 'admin') {
      return <AdminDashboard logs={auditLogs} users={users} onViewDetails={handleOpenViewSessionLogs} />;
    }
    if (mainView === 'staff') {
      return <StaffManagement currentUser={currentUser} allUsers={users} onLinkStaff={handleLinkStaff} onUnlinkStaff={handleUnlinkStaff} />;
    }
    return <PatientDetail 
              currentUser={currentUser}
              patient={selectedPatient} 
              onAddSession={() => setModals(prev => ({...prev, addSession: true}))} 
              onAddDocument={() => setModals(prev => ({...prev, addDocument: true}))} 
              onViewSessionNotes={handleOpenViewNotesModal} 
              onDeletePatient={handleDeletePatient}
              onDeleteSession={handleDeleteSession}
              onTransferPatient={() => setModals(prev => ({...prev, transferPatient: true}))}
              onUpdateSessionStatus={handleUpdateSessionStatus}
            />;
  }

  const allPsychologists = users.filter(u => u.role === 'psychologist');

  return (
    <div className="flex h-screen w-full flex-col font-sans">
      <Header user={currentUser} onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/3 max-w-sm flex-shrink-0 border-r border-slate-200">
          <PatientList
            patients={patientsForCurrentUser}
            currentUser={currentUser}
            selectedPatientId={selectedPatientId}
            onSelectPatient={handleSelectPatient}
            onAddPatient={() => setModals(prev => ({...prev, addPatient: true}))}
            onShowStaffManagement={() => setMainView('staff')}
            onShowAdminDashboard={() => setMainView('admin')}
          />
        </aside>
        <main className="flex-1 overflow-auto">
          {renderMainView()}
        </main>
      </div>

      <AddPatientModal isOpen={modals.addPatient} onClose={() => setModals(prev => ({ ...prev, addPatient: false }))} onSave={handleAddPatient} />
      <SessionEditorModal isOpen={modals.addSession} onClose={() => setModals(prev => ({ ...prev, addSession: false }))} onSave={handleAddSession} />
      <AddDocumentModal isOpen={modals.addDocument} onClose={() => setModals(prev => ({ ...prev, addDocument: false }))} onSave={handleAddDocument} />
      <ViewSessionNotesModal isOpen={modals.viewNotes} onClose={() => setModals(prev => ({ ...prev, viewNotes: false }))} session={sessionToView} />
      <ViewLogDetailsModal isOpen={modals.viewLogDetails} onClose={() => setModals(prev => ({ ...prev, viewLogDetails: false }))} sessionLogs={sessionLogsToView} />
      <DeleteConfirmationModal
        isOpen={modals.deleteConfirmation}
        onClose={() => setModals(prev => ({...prev, deleteConfirmation: false}))}
        onConfirm={handleConfirmDelete}
        title={deleteModalInfo.title}
        message={deleteModalInfo.message}
      />
      <TransferPatientModal
        isOpen={modals.transferPatient}
        onClose={() => setModals(prev => ({...prev, transferPatient: false}))}
        onTransfer={handleTransferPatient}
        psychologists={allPsychologists}
        currentPsychologistId={selectedPatient?.psychologistId}
      />
    </div>
  );
}