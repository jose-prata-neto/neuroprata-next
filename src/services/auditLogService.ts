
import type { AuditLog } from '@/types';
import * as authService from './authService';

const LOGS_STORAGE_KEY = 'neuroprata-audit-logs';

const getLogs = (): AuditLog[] => {
    try {
        const data = localStorage.getItem(LOGS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to load audit logs from localStorage", error);
        return [];
    }
};

const saveLogs = (logs: AuditLog[]): void => {
    try {
        localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
        console.error("Failed to save audit logs to localStorage", error);
    }
};

// Simulate getting a public IP
const getSimulatedIpAddress = (): string => {
    // This is a simulation. In a real app, this would be determined server-side.
    const octet = () => Math.floor(Math.random() * 255);
    return `92.168.${octet()}.${octet()}`;
};

export const logEvent = (action: string, details: Record<string, any> = {}): AuditLog | null => {
    const session = authService.getCurrentUser();
    if (!session) {
      console.warn(`Audit log for action "${action}" was skipped because there is no active user session.`);
      return null;
    }
    
    const { user, sessionId } = session;

    const newLog: AuditLog = {
        id: crypto.randomUUID(),
        userId: user.id,
        userEmail: user.email,
        action,
        details,
        timestamp: new Date().toISOString(),
        ipAddress: getSimulatedIpAddress(),
        sessionId: sessionId,
    };
    
    const logs = getLogs();
    saveLogs([newLog, ...logs]);
    return newLog;
};

export const getAllLogs = (): AuditLog[] => {
    return getLogs();
};
