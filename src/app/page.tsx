"use client"; // Importante: Diz ao Next.js para rodar no navegador
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Patient, Session, Document, User, AuditLog, RegisterData } from '@/types';
import { getPatients, savePatients } from '@/services/storageService';
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
  
    // HOOK MOVED TO TOP to follow Rules of Hooks.
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
        // Em produção, você poderia mostrar uma notificação para o usuário
        throw error; // Re-throw para que o chamador possa tratar
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
          // Em produção, você poderia mostrar uma notificação de erro
        } finally {
          setIsLoading(false);
        }
      };
  
      loadInitialData();
    }, [refreshData]);
  
    const updateLogsState = useCallback((newLog: AuditLog | null) => {
      if (newLog && currentUser?.role === 'admin') {
        setAuditLogs(prev => [newLog, ...prev]);
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
  
    // Helper function para validar se o usuário pode realizar ações
    const canPerformAction = useCallback((action: 'create' | 'delete' | 'transfer') => {
      if (!currentUser) return false;
      if (currentUser.role === 'staff') return false;
      if (action === 'create' && currentUser.role === 'admin') return true;
      if (action === 'delete' && currentUser.role === 'admin') return true;
      if (action === 'transfer' && currentUser.role === 'admin') return true;
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
    }, [patientsForCurrentUser, selectedPatientId, mainView, currentUser?.role]);
  
    const updateAndSavePatients = async (newPatients: Patient[]) => {
      try {
        setPatients(newPatients);
        await savePatients(newPatients);
      } catch (error) {
        console.error("Erro ao salvar pacientes:", error);
        // Em produção, você poderia reverter o estado local em caso de erro
        throw error;
      }
    };
    
    const updateAndSaveUsers = async (newUsers: User[]) => {
      try {
        setUsers(newUsers);
        await authService.saveUsers(newUsers);
      } catch (error) {
        console.error("Erro ao salvar usuários:", error);
        // Em produção, você poderia reverter o estado local em caso de erro
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
          const allPatients = await getPatients();
          let wasUpdated = false;
          const migratedPatients = allPatients.map(p => {
            if (!p.psychologistId && result.user?.role === 'psychologist') {
              wasUpdated = true;
              return { ...p, psychologistId: result.user.id };
            }
            return p;
          });
          
          if (wasUpdated) {
            await updateAndSavePatients(migratedPatients);
          }
          
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
      if (!canPerformAction('create')) return;
  
      try {
        const psychologistId = currentUser?.role === 'psychologist' ? currentUser.id : undefined;
  
        const newPatient: Patient = {
          ...patientData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          sessions: [],
          documents: [],
          psychologistId,
        };
        
        const updatedPatients = [...patients, newPatient];
        await updateAndSavePatients(updatedPatients);
        updateLogsState(auditLogService.logEvent('create_patient', { 
          patientId: newPatient.id, 
          patientName: newPatient.name 
        }));
        setSelectedPatientId(newPatient.id);
        setModals((prev: any) => ({ ...prev, addPatient: false }));
      } catch (error) {
        console.error("Erro ao adicionar paciente:", error);
        // Em produção, você poderia mostrar uma notificação de erro
      }
    };
  
    const handleAddSession = async (sessionData: Omit<Session, 'id'>, files: File[]) => {
      if (!selectedPatientId) return;
  
      try {
        const newSession: Session = { 
          ...sessionData, 
          id: crypto.randomUUID(), 
          attachments: files.map(f => ({ name: f.name, url: '' })) 
        };
        
        const newDocumentsPromises = files.map(async (file) => {
          const dataUrl = await fileToDataURL(file);
          const fileType = getFileType(file.type);
          const sessionDateFormatted = new Date(sessionData.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
          return { 
            id: crypto.randomUUID(), 
            name: `[${sessionDateFormatted}] ${file.name}`, 
            type: fileType, 
            url: dataUrl, 
            uploadedAt: new Date().toISOString() 
          };
        });
        
        const newDocuments = await Promise.all(newDocumentsPromises);
        const updatedPatients = patients.map(p => 
          p.id === selectedPatientId 
            ? { 
                ...p, 
                sessions: [...p.sessions, newSession], 
                documents: [...(p.documents || []), ...newDocuments] 
              } 
            : p
        );
        
        await updateAndSavePatients(updatedPatients);
        updateLogsState(auditLogService.logEvent('create_session', { 
          patientId: selectedPatientId, 
          sessionId: newSession.id, 
          attachmentsCount: files.length 
        }));
        setModals((prev: any) => ({ ...prev, addSession: false }));
      } catch (error) {
        console.error("Erro ao adicionar sessão:", error);
        // Em produção, você poderia mostrar uma notificação de erro
      }
    };
    
    const handleAddDocument = async (documentData: Omit<Document, 'id' | 'uploadedAt' | 'url'>, file: File) => {
      if (!selectedPatientId) return;
  
      try {
        const dataUrl = await fileToDataURL(file);
        const newDocument: Document = { 
          ...documentData, 
          id: crypto.randomUUID(), 
          uploadedAt: new Date().toISOString(), 
          url: dataUrl 
        };
        
        const updatedPatients = patients.map(p => 
          p.id === selectedPatientId 
            ? { ...p, documents: [...(p.documents || []), newDocument] } 
            : p
        );
        
        await updateAndSavePatients(updatedPatients);
        updateLogsState(auditLogService.logEvent('create_document', { 
          patientId: selectedPatientId, 
          documentId: newDocument.id, 
          documentName: newDocument.name 
        }));
        setModals((prev: any) => ({ ...prev, addDocument: false }));
      } catch (error) {
        console.error("Erro ao adicionar documento:", error);
        // Em produção, você poderia mostrar uma notificação de erro
      }
    };
  
    const handleDeletePatient = useCallback((patientId: string) => {
      if (!canPerformAction('delete')) return;
      
      setItemToDelete({ type: 'patient', id: patientId });
      setModals((prev: any) => ({ ...prev, deleteConfirmation: true }));
    }, [canPerformAction]);
  
    const handleDeleteSession = useCallback((sessionId: string) => {
      if (!canPerformAction('delete')) return;
      
      setItemToDelete({ type: 'session', id: sessionId });
      setModals((prev: any) => ({ ...prev, deleteConfirmation: true }));
    }, [canPerformAction]);
  
    const handleConfirmDelete = async () => {
      if (!itemToDelete) return;
  
      try {
        if (itemToDelete.type === 'patient') {
          const patientToDelete = patients.find(p => p.id === itemToDelete.id);
          await updateAndSavePatients(patients.filter(p => p.id !== itemToDelete.id));
          updateLogsState(auditLogService.logEvent('delete_patient', { 
            patientId: itemToDelete.id, 
            patientName: patientToDelete?.name 
          }));
          
          if (selectedPatientId === itemToDelete.id) {
            setSelectedPatientId(null);
          }
        } else if (itemToDelete.type === 'session' && selectedPatientId) {
          const updatedPatients = patients.map(p => {
            if (p.id === selectedPatientId) {
              return { 
                ...p, 
                sessions: p.sessions.filter(s => s.id !== itemToDelete.id) 
              };
            }
            return p;
          });
          
          await updateAndSavePatients(updatedPatients);
          updateLogsState(auditLogService.logEvent('delete_session', { 
            patientId: selectedPatientId, 
            sessionId: itemToDelete.id 
          }));
        }
  
        setItemToDelete(null);
        setModals((prev: any) => ({ ...prev, deleteConfirmation: false }));
      } catch (error) {
        console.error("Erro ao confirmar exclusão:", error);
        // Em produção, você poderia mostrar uma notificação de erro
      }
    };
    
    const handleTransferPatient = async (newPsychologistId: string) => {
      if (!selectedPatientId || !canPerformAction('transfer')) return;
  
      try {
        const updatedPatients = patients.map(p =>
          p.id === selectedPatientId 
            ? { ...p, psychologistId: newPsychologistId } 
            : p
        );
        
        await updateAndSavePatients(updatedPatients);
        const newPsychologist = users.find(u => u.id === newPsychologistId);
        
        updateLogsState(auditLogService.logEvent('transfer_patient', { 
          patientId: selectedPatientId, 
          patientName: selectedPatient?.name,
          newPsychologistId, 
          newPsychologistName: newPsychologist?.name
        }));
        
        setModals((prev: any) => ({ ...prev, transferPatient: false }));
        setSelectedPatientId(null);
      } catch (error) {
        console.error("Erro ao transferir paciente:", error);
        // Em produção, você poderia mostrar uma notificação de erro
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
        // Em produção, você poderia mostrar uma notificação de erro
      }
    };
  
    const handleOpenViewNotesModal = (session: Session) => {
      updateLogsState(auditLogService.logEvent('view_session_notes', { patientId: selectedPatientId, sessionId: session.id }));
      setSessionToView(session);
      setModals((prev: any) => ({ ...prev, viewNotes: true }));
    };
    
    const handleOpenViewSessionLogs = (logs: AuditLog[]) => {
      setSessionLogsToView(logs);
      setModals((prev: any) => ({ ...prev, viewLogDetails: true }));
    }
    
    const selectedPatient = useMemo(() => {
      return patients.find(p => p.id === selectedPatientId) || null;
    }, [patients, selectedPatientId]);
  
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
                onAddSession={() => setModals((prev: any) => ({...prev, addSession: true}))} 
                onAddDocument={() => setModals((prev: any) => ({...prev, addDocument: true}))} 
                onViewSessionNotes={handleOpenViewNotesModal} 
                onDeletePatient={handleDeletePatient}
                onDeleteSession={handleDeleteSession}
                onTransferPatient={() => setModals((prev: any) => ({...prev, transferPatient: true}))}
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
              onAddPatient={() => setModals((prev: any) => ({...prev, addPatient: true}))}
              onShowStaffManagement={() => setMainView('staff')}
              onShowAdminDashboard={() => setMainView('admin')}
            />
          </aside>
          <main className="flex-1 overflow-auto">
            {renderMainView()}
          </main>
        </div>
  
        <AddPatientModal isOpen={modals.addPatient} onClose={() => setModals((prev: any) => ({ ...prev, addPatient: false }))} onSave={handleAddPatient} />
        <SessionEditorModal isOpen={modals.addSession} onClose={() => setModals((prev: any) => ({ ...prev, addSession: false }))} onSave={handleAddSession} />
        <AddDocumentModal isOpen={modals.addDocument} onClose={() => setModals((prev: any) => ({ ...prev, addDocument: false }))} onSave={handleAddDocument} />
        <ViewSessionNotesModal isOpen={modals.viewNotes} onClose={() => setModals((prev: any) => ({ ...prev, viewNotes: false }))} session={sessionToView} />
        <ViewLogDetailsModal isOpen={modals.viewLogDetails} onClose={() => setModals((prev: any) => ({ ...prev, viewLogDetails: false }))} sessionLogs={sessionLogsToView} />
        <DeleteConfirmationModal
          isOpen={modals.deleteConfirmation}
          onClose={() => setModals((prev: any) => ({...prev, deleteConfirmation: false}))}
          onConfirm={handleConfirmDelete}
          title={deleteModalInfo.title}
          message={deleteModalInfo.message}
        />
        <TransferPatientModal
          isOpen={modals.transferPatient}
          onClose={() => setModals((prev: any) => ({...prev, transferPatient: false}))}
          onTransfer={handleTransferPatient}
          psychologists={allPsychologists}
          currentPsychologistId={selectedPatient?.psychologistId}
        />
      </div>
    );
}
