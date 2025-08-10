import {
  ChartBarIcon,
  DownloadIcon,
  EyeIcon,
  File,
  PlusIcon,
  TagIcon,
  TrashIcon,
  UserCircleIcon,
  UserGroupIcon,
} from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useEffect, useState } from 'react';
import { logEvent } from '@/actions/auditLogService';
import type { Document } from '@/interfaces';
import type { Patient, Session, User } from '@/server/db/schema';
import {
  formatBirthDate,
  formatDate,
  formatDateTime,
} from '@/utils/formatters';
import Button from './Button';
import ReportsDashboard from './ReportsDashboard';

interface PatientDetailProps {
  patient: Patient | null;
  currentUser: User;
  onAddSession: () => void;
  onAddDocument: () => void;
  onViewSessionNotes: (session: Session) => void;
  onDeletePatient: (patientId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onTransferPatient: () => void;
  onUpdateSessionStatus: (
    sessionId: string,
    status: 'paid' | 'pending'
  ) => void;
}

type ActiveTab = 'sessions' | 'profile' | 'documents' | 'dashboard';

const TabButton = ({
  tabName,
  currentTab,
  setTab,
  children,
}: {
  tabName: ActiveTab;
  currentTab: ActiveTab;
  setTab: (tab: ActiveTab) => void;
  children: React.ReactNode;
}) => (
  <button
    className={`flex items-center space-x-2 rounded-md px-3 py-2 font-medium text-sm ${
      currentTab === tabName
        ? 'bg-slate-200 text-slate-800'
        : 'text-slate-600 hover:bg-slate-100'
    }`}
    onClick={() => setTab(tabName)}
  >
    {children}
  </button>
);

const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  currentUser,
  onAddSession,
  onAddDocument,
  onViewSessionNotes,
  onDeletePatient,
  onDeleteSession,
  onTransferPatient,
  onUpdateSessionStatus,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sessions');

  useEffect(() => {
    if (patient) {
      setActiveTab('sessions');
      logEvent('view_patient_record', {
        patientId: patient.id,
        patientName: patient.name,
      });
    }
  }, [patient]);

  if (!patient) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <UserGroupIcon />
        <h3 className="mt-4 font-semibold text-slate-700 text-xl">
          Selecione um Paciente
        </h3>
        <p className="mt-1 text-slate-500">
          Escolha um paciente da lista ao lado para ver seus detalhes e
          histórico de sessões.
        </p>
      </div>
    );
  }

  const sortedSessions = [...(patient.sessions || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const canManagePatient =
    currentUser.role === 'admin' || currentUser.id === patient.psychologistId;
  const canEditSessions = canManagePatient || currentUser.role === 'staff';

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <div className="flex items-center space-x-4">
            {patient.photoUrl ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-full">
                <Image
                  alt={patient.name}
                  className="object-cover"
                  fill
                  src={patient.photoUrl}
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
                <UserCircleIcon className="h-10 w-10 text-slate-500" />
              </div>
            )}
            <div>
              <h2 className="font-bold text-3xl text-slate-800">
                {patient.name}
              </h2>
              <p className="mt-1 text-slate-500 text-sm">
                Paciente desde {formatDate(patient.createdAt)}
              </p>
            </div>
          </div>
          {canEditSessions && (
            <Button className="mt-4 sm:mt-0" onClick={onAddSession}>
              <PlusIcon />{' '}
              <span className="ml-2 hidden sm:inline">Nova Sessão</span>
            </Button>
          )}
        </div>

        <div className="mt-6 border-slate-200 border-b">
          <nav aria-label="Tabs" className="-mb-px flex space-x-4">
            <TabButton
              currentTab={activeTab}
              setTab={setActiveTab}
              tabName="sessions"
            >
              <File className="h-4 w-4" />
              <span>Sessões</span>
            </TabButton>
            <TabButton
              currentTab={activeTab}
              setTab={setActiveTab}
              tabName="profile"
            >
              <UserCircleIcon className="h-4 w-4" />
              <span>Perfil</span>
            </TabButton>
            <TabButton
              currentTab={activeTab}
              setTab={setActiveTab}
              tabName="documents"
            >
              <DocumentIcon className="h-4 w-4" />
              <span>Documentos</span>
            </TabButton>
            <TabButton
              currentTab={activeTab}
              setTab={setActiveTab}
              tabName="dashboard"
            >
              <ChartBarIcon className="h-4 w-4" />
              <span>Relatórios</span>
            </TabButton>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'sessions' && (
            <div>
              <h3 className="mb-4 font-bold text-slate-800 text-xl">
                Histórico de Sessões
              </h3>
              {sortedSessions.length > 0 ? (
                <div className="space-y-6">
                  {sortedSessions.map((session) => (
                    <div
                      className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm"
                      key={session.id}
                    >
                      <div className="flex items-center justify-between border-slate-200 border-b bg-slate-50/50 p-4">
                        <p className="font-semibold text-slate-700">
                          {formatDateTime(session.date)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-slate-500 text-sm">
                            {session.duration} min - {session.sessionType}
                          </p>
                          {canEditSessions && (
                            <button
                              className="text-slate-400 hover:text-red-600"
                              onClick={() => onDeleteSession(session.id)}
                              title="Excluir sessão"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex-grow space-y-4 p-6">
                        <div>
                          <h4 className="font-semibold text-slate-800">
                            Anotações da Sessão
                          </h4>
                          <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-slate-600">
                            {session.notes ||
                              'Nenhuma anotação para esta sessão.'}
                          </p>
                        </div>
                        {session.tags && session.tags.length > 0 && (
                          <div>
                            <h5 className="flex items-center font-semibold text-slate-800 text-sm">
                              <TagIcon className="mr-2 h-4 w-4 text-slate-500" />{' '}
                              Tags Clínicas
                            </h5>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {session.tags.map((tag) => (
                                <span
                                  className="rounded-full bg-slate-200 px-2 py-1 font-medium text-slate-700 text-xs"
                                  key={tag.id}
                                >
                                  {tag.text}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-slate-200 border-t bg-slate-50/50 p-3">
                        <div>
                          {session.paymentStatus === 'paid' ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 font-medium text-green-800 text-xs">
                              Pago
                            </span>
                          ) : (
                            <span className="rounded-full bg-yellow-100 px-2 py-1 font-medium text-xs text-yellow-800">
                              Pendente
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {session.paymentStatus === 'pending' &&
                            canEditSessions && (
                              <Button
                                onClick={() =>
                                  onUpdateSessionStatus(session.id, 'paid')
                                }
                                size="sm"
                                variant="secondary"
                              >
                                Marcar como Pago
                              </Button>
                            )}
                          {session.paymentStatus === 'paid' &&
                            canEditSessions && (
                              <Button
                                onClick={() =>
                                  onUpdateSessionStatus(session.id, 'pending')
                                }
                                size="sm"
                                variant="ghost"
                              >
                                Marcar como Pendente
                              </Button>
                            )}
                          {session.notes && (
                            <Button
                              onClick={() => onViewSessionNotes(session)}
                              size="sm"
                              variant="secondary"
                            >
                              <EyeIcon className="mr-2 h-5 w-5" /> Ver anotação
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-lg border-2 border-slate-300 border-dashed p-12 text-center">
                  <h4 className="font-semibold text-lg text-slate-700">
                    Nenhuma sessão registrada
                  </h4>
                  <p className="mt-1 text-slate-500">
                    Clique em &quot;Nova Sessão&quot; para adicionar a primeira
                    para este paciente.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CÓDIGO RESTAURADO ABAIXO */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-bold text-slate-800 text-xl">
                  Perfil do Paciente
                </h3>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm md:grid-cols-2">
                  <div className="text-slate-600">
                    <strong className="block text-slate-800">Nome:</strong>{' '}
                    {patient.name}
                  </div>
                  <div className="text-slate-600">
                    <strong className="block text-slate-800">CPF:</strong>{' '}
                    {patient.cpf}
                  </div>
                  <div className="text-slate-600">
                    <strong className="block text-slate-800">
                      Nascimento:
                    </strong>{' '}
                    {formatBirthDate(patient.birthDate)}
                  </div>
                  <div className="text-slate-600">
                    <strong className="block text-slate-800">Email:</strong>{' '}
                    {patient.email || 'N/A'}
                  </div>
                  <div className="text-slate-600">
                    <strong className="block text-slate-800">Telefone:</strong>{' '}
                    {patient.phone || 'N/A'}
                  </div>
                  <div className="text-slate-600">
                    <strong className="block text-slate-800">
                      Consentimento Digital:
                    </strong>{' '}
                    {patient.consent ? 'Sim' : 'Não'}
                  </div>
                  <div className="text-slate-600">
                    <strong className="block text-slate-800">
                      Tipo de Pagamento:
                    </strong>{' '}
                    {patient.paymentType === 'plano'
                      ? 'Plano de Saúde'
                      : 'Particular'}
                  </div>
                  {patient.paymentType === 'plano' && (
                    <div className="text-slate-600">
                      <strong className="block text-slate-800">
                        Plano de Saúde:
                      </strong>{' '}
                      {patient.healthPlan || 'N/A'}
                    </div>
                  )}
                  <div className="col-span-1 text-slate-600 md:col-span-2">
                    <strong className="block text-slate-800">
                      Histórico Médico:
                    </strong>{' '}
                    <p className="mt-1 whitespace-pre-wrap">
                      {patient.medicalHistory || 'Nenhum histórico informado.'}
                    </p>
                  </div>
                </div>
              </div>
              {canManagePatient && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-6 shadow-sm">
                  <h3 className="font-bold text-red-800 text-xl">
                    Zona de Perigo
                  </h3>
                  <p className="mt-2 text-red-700 text-sm">
                    As ações abaixo são irreversíveis. Tenha certeza do que está
                    fazendo.
                  </p>
                  <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <Button onClick={onTransferPatient} variant="secondary">
                      Transferir Paciente
                    </Button>
                    <Button
                      onClick={() => onDeletePatient(patient.id)}
                      variant="danger"
                    >
                      Excluir Paciente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'documents' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-xl">Documentos</h3>
                {canEditSessions && (
                  <Button onClick={onAddDocument}>
                    <PlusIcon />{' '}
                    <span className="ml-2 hidden sm:inline">
                      Adicionar Documento
                    </span>
                  </Button>
                )}
              </div>
              {patient.documents && patient.documents.length > 0 ? (
                <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
                  {patient.documents.map((doc: Document) => (
                    <li
                      className="flex items-center justify-between p-4 hover:bg-slate-50"
                      key={doc.id}
                    >
                      <div className="flex min-w-0 items-center space-x-4">
                        <DocumentIcon className="h-6 w-6 flex-shrink-0 text-slate-500" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">
                            {doc.name}
                          </p>
                          <p className="text-slate-500 text-sm">
                            Tipo: {doc.type} &middot; Adicionado em:{' '}
                            {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <a
                        aria-label={`Baixar ${doc.name}`}
                        className="ml-4 inline-flex flex-shrink-0 items-center justify-center rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                        download={doc.name}
                        href={doc.url}
                        title={`Baixar ${doc.name}`}
                      >
                        <DownloadIcon className="h-5 w-5" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-6 rounded-lg border-2 border-slate-300 border-dashed p-12 text-center">
                  <DocumentIcon className="mx-auto h-12 w-12 text-slate-400" />
                  <h4 className="mt-4 font-semibold text-lg text-slate-700">
                    Nenhum documento adicionado
                  </h4>
                  <p className="mt-1 text-slate-500">
                    Clique no botão acima para adicionar o primeiro documento do
                    paciente.
                  </p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'dashboard' && <ReportsDashboard patient={patient} />}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
