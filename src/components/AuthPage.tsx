import { Brain } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { RegisterData } from '@/interfaces';
import Button from './Button';

interface AuthPageProps {
  onLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  onRegister: (
    data: RegisterData
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'psychologist' | 'staff'>('psychologist');
  const [identifier, setIdentifier] = useState(''); // Holds CRP or CPF
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    let result;
    if (isLoginView) {
      result = await onLogin(email, password);
    } else {
      if (!(name && identifier)) {
        setError(
          `Nome e ${role === 'psychologist' ? 'CRP' : 'CPF'} são obrigatórios.`
        );
        setIsLoading(false);
        return;
      }
      result = await onRegister({ name, email, password, role, identifier });
    }

    if (result && !result.success) {
      setError(result.error || 'Ocorreu um erro.');
    }
    setIsLoading(false);
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
    setIdentifier('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <Brain className="mx-auto h-12 w-12 text-slate-800" />
          <h1 className="mt-3 font-bold text-3xl text-slate-800">NeuroPrata</h1>
          <p className="mt-1 text-slate-500">
            {isLoginView ? 'Bem-vindo(a) de volta!' : 'Crie sua conta'}
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {!isLoginView && (
            <>
              <div>
                <label className="block font-medium text-slate-700 text-sm">
                  Tipo de Conta
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1">
                  <button
                    className={`rounded px-3 py-1 font-semibold text-sm ${
                      role === 'psychologist'
                        ? 'bg-white text-slate-800 shadow'
                        : 'text-slate-600'
                    }`}
                    onClick={() => setRole('psychologist')}
                    type="button"
                  >
                    Psicólogo(a)
                  </button>
                  <button
                    className={`rounded px-3 py-1 font-semibold text-sm ${
                      role === 'staff'
                        ? 'bg-white text-slate-800 shadow'
                        : 'text-slate-600'
                    }`}
                    onClick={() => setRole('staff')}
                    type="button"
                  >
                    Funcionário(a)
                  </button>
                </div>
              </div>
              <div>
                <label className="sr-only" htmlFor="name">
                  Nome
                </label>
                <input
                  autoComplete="name"
                  className="relative block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
                  id="name"
                  name="name"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome Completo"
                  required
                  type="text"
                  value={name}
                />
              </div>
            </>
          )}
          <div>
            <label className="sr-only" htmlFor="email-address">
              Email
            </label>
            <input
              autoComplete="email"
              className="relative block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
              id="email-address"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              type="email"
              value={email}
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="password">
              Senha
            </label>
            <input
              autoComplete="current-password"
              className="relative block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
              id="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              type="password"
              value={password}
            />
          </div>
          {!isLoginView && (
            <div>
              <label className="sr-only" htmlFor="identifier">
                {role === 'psychologist' ? 'CRP' : 'CPF'}
              </label>
              <input
                className="relative block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
                id="identifier"
                name="identifier"
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  role === 'psychologist'
                    ? 'CRP (ex: 06/123456)'
                    : 'CPF (somente números)'
                }
                required
                type="text"
                value={identifier}
              />
            </div>
          )}

          {error && <p className="text-center text-red-600 text-sm">{error}</p>}

          <div>
            <Button className="w-full" isLoading={isLoading} type="submit">
              {isLoading
                ? 'Processando...'
                : isLoginView
                  ? 'Entrar'
                  : 'Registrar'}
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-slate-500 text-sm">
          {isLoginView ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          <button
            className="ml-1 font-medium text-slate-600 hover:text-slate-800"
            onClick={toggleView}
          >
            {isLoginView ? 'Registre-se' : 'Faça login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
