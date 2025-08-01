import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Patient, Session, Document, User } from '@/types';
import Button from './Button';
import { PlusIcon, UserGroupIcon, UserCircleIcon, DocumentIcon, ChartBarIcon, TagIcon, DownloadIcon, EyeIcon, TrashIcon } from '@/constants';
import ReportsDashboard from './ReportsDashboard';
import { logEvent } from '@/services/auditLogService';
import { formatDate, formatBirthDate, formatDateTime } from '@/utils/formatters';

interface PatientDetailProps {
  patient: Patient | null;
  currentUser: User;
  onAddSession: () => void;
  onAddDocument: () => void;
  onViewSessionNotes: (session: Session) => void;
  onDeletePatient: (patientId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onTransferPatient: () => void;
  onUpdateSessionStatus: (sessionId: string, status: 'paid' | 'pending') => void;
}

type ActiveTab = 'sessions' | 'profile' | 'documents' | 'dashboard';

const TabButton = ({ tabName, currentTab, setTab, children }: {
  tabName: ActiveTab,
  currentTab: ActiveTab,
  setTab: (tab: ActiveTab) => void,
  children: React.ReactNode
}) => (
  <button
    onClick={() => setTab(tabName)}
    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md ${
      currentTab === tabName
        ? 'bg-slate-200 text-slate-800'
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
);

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, currentUser, onAddSession, onAddDocument, onViewSessionNotes, onDeletePatient, onDeleteSession, onTransferPatient, onUpdateSessionStatus }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sessions');

  useEffect(() => {
    if (patient) {
      setActiveTab('sessions');
      logEvent('view_patient_record', { patientId: patient.id, patientName: patient.name });
    }
  }, [patient]);

  if (!patient) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-slate-50">
        <UserGroupIcon />
        <h3 className="mt-4 text-xl font-semibold text-slate-700">Selecione um Paciente</h3>
        <p className="mt-1 text-slate-500">Escolha um paciente da lista ao lado para ver seus detalhes e histórico de sessões.</p>
      </div>
    );
  }

  const sortedSessions = [...(patient.sessions || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const canManagePatient = currentUser.role === 'admin' || currentUser.id === patient.psychologistId;
  const canEditSessions = canManagePatient || currentUser.role === 'staff';

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            {patient.photoUrl ? (
              <div className="relative h-16 w-16 rounded-full overflow-hidden">
                <Image src={patient.photoUrl} alt={patient.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center">
                <UserCircleIcon className="h-10 w-10 text-slate-500" />
              </div>
            )}
            <div>
              <h2 className="text-3xl font-bold text-slate-800">{patient.name}</h2>
              <p className="text-sm text-slate-500 mt-1">Paciente desde {formatDate(patient.createdAt)}</p>
            </div>
          </div>
          {canEditSessions && (
            <Button onClick={onAddSession} className="mt-4 sm:mt-0">
              <PlusIcon /> <span className="ml-2 hidden sm:inline">Nova Sessão</span>
            </Button>
          )}
        </div>

        <div className="mt-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <TabButton tabName="sessions" currentTab={activeTab} setTab={setActiveTab}><DocumentIcon className="h-4 w-4" /><span>Sessões</span></TabButton>
            <TabButton tabName="profile" currentTab={activeTab} setTab={setActiveTab}><UserCircleIcon className="h-4 w-4" /><span>Perfil</span></TabButton>
            <TabButton tabName="documents" currentTab={activeTab} setTab={setActiveTab}><DocumentIcon className="h-4 w-4" /><span>Documentos</span></TabButton>
            <TabButton tabName="dashboard" currentTab={activeTab} setTab={setActiveTab}><ChartBarIcon className="h-4 w-4" /><span>Relatórios</span></TabButton>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'sessions' && (
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Histórico de Sessões</h3>
              {sortedSessions.length > 0 ? (
                <div className="space-y-6">
                  {sortedSessions.map((session) => (
                    <div key={session.id} className="rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col">
                      <div className="border-b border-slate-200 bg-slate-50/50 p-4 flex justify-between items-center">
                        <p className="font-semibold text-slate-700">{formatDateTime(session.date)}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-slate-500">{session.duration} min - {session.sessionType}</p>
                          {canEditSessions && (
                            <button onClick={() => onDeleteSession(session.id)} className="text-slate-400 hover:text-red-600" title="Excluir sessão">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="p-6 space-y-4 flex-grow">
                        <div>
                            <h4 className="font-semibold text-slate-800">Anotações da Sessão</h4>
                            <p className="mt-2 text-slate-600 whitespace-pre-wrap line-clamp-4">{session.notes || "Nenhuma anotação para esta sessão."}</p>
                        </div>
                        {session.tags && session.tags.length > 0 && (
                          <div>
                            <h5 className="flex items-center font-semibold text-slate-800 text-sm">
                              <TagIcon className="mr-2 h-4 w-4 text-slate-500" /> Tags Clínicas
                            </h5>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {session.tags.map(tag => (<span key={tag.id} className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded-full">{tag.text}</span>))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-slate-200 bg-slate-50/50 p-3 flex justify-between items-center">
                        <div>
                          {session.paymentStatus === 'paid' ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Pago</span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Pendente</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {session.paymentStatus === 'pending' && canEditSessions && (
                            <Button variant="secondary" onClick={() => onUpdateSessionStatus(session.id, 'paid')} size="sm">Marcar como Pago</Button>
                          )}
                          {session.paymentStatus === 'paid' && canEditSessions && (
                            <Button variant="ghost" onClick={() => onUpdateSessionStatus(session.id, 'pending')} size="sm">Marcar como Pendente</Button>
                          )}
                          {session.notes && (
                            <Button variant="secondary" onClick={() => onViewSessionNotes(session)} size="sm">
                              <EyeIcon className="mr-2 h-5 w-5" /> Ver anotação
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
                  <h4 className="text-lg font-semibold text-slate-700">Nenhuma sessão registrada</h4>
                  <p className="mt-1 text-slate-500">Clique em &quot;Nova Sessão&quot; para adicionar a primeira para este paciente.</p>
                </div>
              )}
            </div>
          )}

          {/* CÓDIGO RESTAURADO ABAIXO */}
          {activeTab === 'profile' && (
             <div className="space-y-6">
                 <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                     <h3 className="text-xl font-bold text-slate-800 mb-4">Perfil do Paciente</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="text-slate-600"><strong className="text-slate-800 block">Nome:</strong> {patient.name}</div>
                        <div className="text-slate-600"><strong className="text-slate-800 block">CPF:</strong> {patient.cpf}</div>
                        <div className="text-slate-600"><strong className="text-slate-800 block">Nascimento:</strong> {formatBirthDate(patient.birthDate)}</div>
                        <div className="text-slate-600"><strong className="text-slate-800 block">Email:</strong> {patient.email || 'N/A'}</div>
                        <div className="text-slate-600"><strong className="text-slate-800 block">Telefone:</strong> {patient.phone || 'N/A'}</div>
                        <div className="text-slate-600"><strong className="text-slate-800 block">Consentimento Digital:</strong> {patient.consent ? "Sim" : "Não"}</div>
                        <div className="text-slate-600"><strong className="text-slate-800 block">Tipo de Pagamento:</strong> {patient.paymentType === 'plano' ? 'Plano de Saúde' : 'Particular'}</div>
                        {patient.paymentType === 'plano' && (
                            <div className="text-slate-600"><strong className="text-slate-800 block">Plano de Saúde:</strong> {patient.healthPlan || 'N/A'}</div>
                        )}
                        <div className="text-slate-600 col-span-1 md:col-span-2"><strong className="text-slate-800 block">Histórico Médico:</strong> <p className="mt-1 whitespace-pre-wrap">{patient.medicalHistory || 'Nenhum histórico informado.'}</p></div>
                     </div>
                 </div>
                 {canManagePatient && (
                    <div className="rounded-xl border border-red-300 bg-red-50 p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-red-800">Zona de Perigo</h3>
                        <p className="mt-2 text-sm text-red-700">As ações abaixo são irreversíveis. Tenha certeza do que está fazendo.</p>
                        <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                            <Button variant="secondary" onClick={onTransferPatient}>
                                Transferir Paciente
                            </Button>
                             <Button variant="danger" onClick={() => onDeletePatient(patient.id)}>
                                Excluir Paciente
                            </Button>
                        </div>
                    </div>
                 )}
             </div>
          )}
          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Documentos</h3>
                {canEditSessions && (
                    <Button onClick={onAddDocument}>
                        <PlusIcon /> <span className="ml-2 hidden sm:inline">Adicionar Documento</span>
                    </Button>
                )}
              </div>
              {patient.documents && patient.documents.length > 0 ? (
                  <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
                    {patient.documents.map((doc: Document) => (
                      <li key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center space-x-4 min-w-0">
                          <DocumentIcon className="h-6 w-6 text-slate-500 flex-shrink-0" />
                          <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate">{doc.name}</p>
                              <p className="text-sm text-slate-500">Tipo: {doc.type} &middot; Adicionado em: {formatDate(doc.uploadedAt)}</p>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          download={doc.name}
                          className="ml-4 inline-flex items-center justify-center p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors flex-shrink-0"
                          aria-label={`Baixar ${doc.name}`}
                          title={`Baixar ${doc.name}`}
                        >
                            <DownloadIcon className="h-5 w-5" />
                        </a>
                      </li>
                    ))}
                  </ul>
              ) : (
                <div className="mt-6 rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
                    <DocumentIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <h4 className="mt-4 text-lg font-semibold text-slate-700">Nenhum documento adicionado</h4>
                    <p className="mt-1 text-slate-500">Clique no botão acima para adicionar o primeiro documento do paciente.</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'dashboard' && (
              <ReportsDashboard patient={patient} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;