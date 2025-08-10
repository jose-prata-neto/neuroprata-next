import { Eye } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import type { AuditLog, User } from '@/server/db/schema';
import { formatShortDateTime } from '@/utils/formatters';
import Button from './Button';

interface AdminDashboardProps {
  logs: AuditLog[];
  users: User[];
  onViewDetails: (logs: AuditLog[]) => void;
}

interface UserSession {
  sessionId: string;
  userId: string;
  userEmail: string;
  loginTime: string;
  logoutTime: string | null;
  ipAddress: string;
  actions: AuditLog[];
}

const ITEMS_PER_PAGE = 10;

const actionLabels: Record<string, string> = {
  login_success: 'Login Bem-sucedido',
  logout: 'Logout',
  create_patient: 'Criação de Paciente',
  delete_patient: 'Exclusão de Paciente',
  transfer_patient: 'Transferência de Paciente',
  view_patient_record: 'Visualização de Prontuário',
  create_session: 'Criação de Sessão',
  delete_session: 'Exclusão de Sessão',
  view_session_notes: 'Visualização de Anotações',
  create_document: 'Criação de Documento',
  link_staff: 'Vínculo de Funcionário',
  unlink_staff: 'Desvínculo de Funcionário',
};

// Helper function moved outside the main component for stability and best practices.
const renderLogoutTime = (dateString: string | null) => {
  if (!dateString)
    return <span className="font-semibold text-green-600">Ativa</span>;
  return formatShortDateTime(dateString);
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  logs,
  users,
  onViewDetails,
}) => {
  const [filters, setFilters] = useState({
    user: '',
    action: '',
    startDate: '',
    endDate: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const allUsers = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );

  const allActionTypes = useMemo(() => {
    const actionSet = new Set<string>();
    logs.forEach((log) => actionSet.add(log.action));
    return Array.from(actionSet).sort((a, b) =>
      (actionLabels[a] || a).localeCompare(actionLabels[b] || b)
    );
  }, [logs]);

  const userSessions = useMemo(() => {
    const sessions: { [key: string]: UserSession } = {};
    const logsSorted = [...logs].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const log of logsSorted) {
      if (!log.sessionId) continue;

      if (log.action === 'login_success') {
        if (!sessions[log.sessionId]) {
          sessions[log.sessionId] = {
            sessionId: log.sessionId,
            userId: log.userId,
            userEmail: log.userEmail,
            loginTime: log.timestamp,
            logoutTime: null,
            ipAddress: log.ipAddress,
            actions: [log],
          };
        }
      } else if (sessions[log.sessionId]) {
        sessions[log.sessionId].actions.push(log);
        if (log.action === 'logout') {
          sessions[log.sessionId].logoutTime = log.timestamp;
        }
      }
    }
    return Object.values(sessions).sort(
      (a, b) =>
        new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime()
    );
  }, [logs]);

  const filteredSessions = useMemo(() => {
    return userSessions.filter((session) => {
      const loginDate = new Date(session.loginTime);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      if (startDate && loginDate < startDate) return false;
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
        if (loginDate > endDate) return false;
      }
      if (filters.user && session.userId !== filters.user) return false;
      if (
        filters.action &&
        !session.actions.some((a) => a.action === filters.action)
      ) {
        return false;
      }

      return true;
    });
  }, [userSessions, filters]);

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <h2 className="mb-6 font-bold text-3xl text-slate-800">
        Painel de Auditoria - Sessões
      </h2>

      <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            className="block font-medium text-slate-700 text-sm"
            htmlFor="user"
          >
            Usuário
          </label>
          <select
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            id="user"
            name="user"
            onChange={handleFilterChange}
            value={filters.user}
          >
            <option value="">Todos</option>
            {allUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block font-medium text-slate-700 text-sm"
            htmlFor="action"
          >
            Tipo de Ação
          </label>
          <select
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            id="action"
            name="action"
            onChange={handleFilterChange}
            value={filters.action}
          >
            <option value="">Todos os Tipos</option>
            {allActionTypes.map((action) => (
              <option key={action} value={action}>
                {actionLabels[action] || action}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block font-medium text-slate-700 text-sm"
            htmlFor="startDate"
          >
            Data Inicial
          </label>
          <input
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            id="startDate"
            name="startDate"
            onChange={handleFilterChange}
            type="date"
            value={filters.startDate}
          />
        </div>
        <div>
          <label
            className="block font-medium text-slate-700 text-sm"
            htmlFor="endDate"
          >
            Data Final
          </label>
          <input
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            id="endDate"
            name="endDate"
            onChange={handleFilterChange}
            type="date"
            value={filters.endDate}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th
                className="px-6 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wider"
                scope="col"
              >
                Usuário
              </th>
              <th
                className="px-6 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wider"
                scope="col"
              >
                Login
              </th>
              <th
                className="px-6 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wider"
                scope="col"
              >
                Logout
              </th>
              <th
                className="px-6 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wider"
                scope="col"
              >
                IP
              </th>
              <th
                className="px-6 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wider"
                scope="col"
              >
                Ações
              </th>
              <th className="relative px-6 py-3" scope="col">
                <span className="sr-only">Detalhes</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {paginatedSessions.map((session) => (
              <tr className="hover:bg-slate-50" key={session.sessionId}>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800 text-sm">
                  {session.userEmail}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-600 text-sm">
                  {formatShortDateTime(session.loginTime)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-600 text-sm">
                  {renderLogoutTime(session.logoutTime)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-600 text-sm">
                  {session.ipAddress}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-slate-600 text-sm">
                  {session.actions.length}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-sm">
                  <Button
                    onClick={() => onViewDetails(session.actions)}
                    size="sm"
                    variant="ghost"
                  >
                    <Eye className="mr-1 h-4 w-4" /> Ver Detalhes
                  </Button>
                </td>
              </tr>
            ))}
            {paginatedSessions.length === 0 && (
              <tr>
                <td className="py-12 text-center text-slate-500" colSpan={6}>
                  Nenhuma sessão encontrada para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-slate-600 text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <div className="space-x-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              variant="secondary"
            >
              Anterior
            </Button>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              variant="secondary"
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
