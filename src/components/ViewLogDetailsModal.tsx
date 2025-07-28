

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import type { AuditLog } from '@/types';
import { formatShortDateTime } from '@/utils/formatters';

interface ViewLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionLogs: AuditLog[];
}

// Helper function moved outside for stability and best practices.
const getDuration = (startTime: string, logoutTime: string | null): string => {
    const start = new Date(startTime).getTime();
    const end = logoutTime ? new Date(logoutTime).getTime() : Date.now();
    const diff = Math.abs(end - start);
    const minutes = Math.floor((diff / 1000) / 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${minutes}m ${seconds}s`;
};

const LOGS_PER_PAGE = 5;

const ViewLogDetailsModal: React.FC<ViewLogDetailsModalProps> = ({ isOpen, onClose, sessionLogs }) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Reset state when the modal is opened with new logs
    if (isOpen) {
      setCurrentPage(1);
      setExpandedLogId(null);
    }
  }, [isOpen, sessionLogs]);

  if (!sessionLogs || sessionLogs.length === 0) {
    return null;
  }
  
  // Pagination logic
  const totalPages = Math.ceil(sessionLogs.length / LOGS_PER_PAGE);
  const paginatedLogs = sessionLogs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE
  );

  const sessionInfo = sessionLogs[0]; // login_success event
  const logoutInfo = sessionLogs.find(log => log.action === 'logout');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Sessão de Auditoria">
      <div className="space-y-4">
        {/* Session Summary */}
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div><strong className="block text-slate-800">Usuário:</strong> <span className="text-slate-600">{sessionInfo.userEmail}</span></div>
            <div><strong className="block text-slate-800">Endereço IP:</strong> <span className="text-slate-600">{sessionInfo.ipAddress}</span></div>
            <div><strong className="block text-slate-800">Login:</strong> <span className="text-slate-600">{new Date(sessionInfo.timestamp).toLocaleString('pt-BR')}</span></div>
            <div><strong className="block text-slate-800">Duração:</strong> <span className="text-slate-600">{getDuration(sessionInfo.timestamp, logoutInfo?.timestamp || null)}</span></div>
        </div>
        
        {/* Timeline */}
        <div>
           <label className="block text-sm font-semibold text-slate-800 mb-2">Linha do Tempo das Ações</label>
           <div className="h-80 overflow-y-auto rounded-md border border-slate-200 bg-white p-4">
             <ol className="relative border-l border-slate-200">
                {paginatedLogs.map(log => (
                    <li key={log.id} className="mb-6 ml-6">
                        <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 ring-8 ring-white">
                           <svg className="h-3 w-3 text-slate-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002 2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                        </span>
                        <h3 className="flex items-center text-base font-semibold text-slate-900">
                           {log.action}
                           {log.action === 'login_success' && <span className="mr-2 ml-3 rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">Início</span>}
                           {log.action === 'logout' && <span className="mr-2 ml-3 rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-800">Fim</span>}
                        </h3>
                        <time className="mb-2 block text-sm font-normal leading-none text-slate-500">{formatShortDateTime(log.timestamp)}</time>
                        <Button variant="ghost" size="sm" onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}>
                           {expandedLogId === log.id ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                        </Button>
                        {expandedLogId === log.id && (
                             <pre className="mt-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-md border whitespace-pre-wrap">
                                {JSON.stringify(log.details, null, 2)}
                             </pre>
                        )}
                    </li>
                ))}
             </ol>
           </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="secondary" size="sm">
                Anterior
            </Button>
            <span className="text-sm text-slate-600">Página {currentPage} de {totalPages}</span>
            <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} variant="secondary" size="sm">
                Próximo
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button type="button" onClick={onClose} variant="secondary">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewLogDetailsModal;
