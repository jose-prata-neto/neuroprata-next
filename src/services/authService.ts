
import type { User, RegisterData } from '@/types';
import { logEvent } from './auditLogService';

const CURRENT_USER_SESSION_KEY = 'neuroprata-current-user';

// --- Funções da API de Utilizadores ---

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Falha ao buscar utilizadores da API');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Falha ao buscar utilizadores da API", error);
    return [];
  }
};

export const saveUsers = async (users: User[]): Promise<void> => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users),
    });
    if (!response.ok) {
      throw new Error('Falha ao salvar utilizadores na API');
    }
  } catch (error) {
    console.error("Falha ao salvar utilizadores na API", error);
    throw error;
  }
};

// --- Funções de Sessão (ainda usam sessionStorage, mas serão substituídas pelo NextAuth) ---

export const saveCurrentUser = (user: User): string => {
    const sessionId = crypto.randomUUID();
    sessionStorage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify({ user, sessionId }));
    return sessionId;
};

export const getCurrentUser = (): { user: User, sessionId: string } | null => {
    try {
        const data = sessionStorage.getItem(CURRENT_USER_SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Falha ao carregar utilizador atual do sessionStorage", error);
        return null;
    }
};

export const clearCurrentUser = (): void => {
    sessionStorage.removeItem(CURRENT_USER_SESSION_KEY);
};

// --- Funções de Autenticação ---

export const register = async (data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
        let users = await getUsers();
        if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
            return { success: false, error: 'Este e-mail já está em uso.' };
        }
        const passwordHash = `hashed_${data.password}`;
        const newUser: User = {
            id: crypto.randomUUID(),
            name: data.name,
            email: data.email,
            passwordHash,
            role: data.role,
            crp: data.role === 'psychologist' ? data.identifier : undefined,
            cpf: data.role === 'staff' ? data.identifier : undefined,
        };
        await saveUsers([...users, newUser]);
        return { success: true, user: newUser };
    } catch (error) {
        console.error("Erro no registo:", error);
        return { success: false, error: 'Erro interno do servidor' };
    }
};

export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
        const users = await getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        const passwordHash = `hashed_${password}`;

        if (user && user.passwordHash === passwordHash) {
            saveCurrentUser(user);
            logEvent('login_success');
            return { success: true, user };
        }

        return { success: false, error: 'E-mail ou senha inválidos.' };
    } catch (error) {
        console.error("Erro no login:", error);
        return { success: false, error: 'Erro interno do servidor' };
    }
};

export const logout = (): void => {
    logEvent('logout');
    clearCurrentUser();
};


